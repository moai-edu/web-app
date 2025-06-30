import { classDao, userDao, userJoinClassDao } from '@/persist/db'
import { UserJoinClass } from './types'
import { User } from 'next-auth'

export class UserJoinClassDomain {
    constructor() {}

    async getById(id: string): Promise<UserJoinClass | null> {
        const joinedClass = await userJoinClassDao.getById(id)
        const _class = await classDao.getById(joinedClass!.classId)
        const user = await userDao.getById(joinedClass!.userId)
        const creator = await userDao.getById(_class!.userId)

        joinedClass!.class = _class!
        joinedClass!.class.user = creator!
        joinedClass!.user = user!
        return joinedClass
    }

    async userJoinClassByCode(
        userId: string,
        classCode: string
    ): Promise<UserJoinClass | null> {
        const _class = await classDao.getByCode(classCode)
        if (!_class) {
            throw new Error('Class not found')
        }
        const joinedClasses = await userJoinClassDao.getListByUserId(userId)
        const joinedClass = joinedClasses.find((c) => c.classId === _class.id)
        if (joinedClass) {
            console.log('User already joined class, return the existed join')
            return joinedClass
        }

        const join: UserJoinClass = {
            id: crypto.randomUUID(),
            userId,
            classId: _class.id,
            joinedAt: new Date()
        }
        return await userJoinClassDao.create(join)
    }

    async getListByUser(user: User): Promise<UserJoinClass[]> {
        const joinedClasses = await userJoinClassDao.getListByUserId(user.id!)
        for (const joinedClass of joinedClasses) {
            const _class = await classDao.getById(joinedClass.classId)
            joinedClass.class = _class!
            joinedClass.user = user
        }
        return joinedClasses
    }

    async getListByClassId(classId: string): Promise<UserJoinClass[]> {
        const joinedUsers = await userJoinClassDao.getListByClassId(classId)
        for (const joinedUser of joinedUsers) {
            const user = await userDao.getById(joinedUser.userId)
            joinedUser.user = user!
        }
        return joinedUsers
    }

    async delete(id: string): Promise<UserJoinClass | null> {
        return await userJoinClassDao.delete(id)
    }
}
