import { classDao, userDao, userJoinClassDao } from '@/persist/db'
import { UserJoinClass } from './types'
import { User } from 'next-auth'

export class UserJoinClassDomain {
    constructor() {}

    async userJoinClassByCode(userId: string, classCode: string): Promise<UserJoinClass | null> {
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
        return await userJoinClassDao.getListByClassId(classId)
    }

    async delete(id: string): Promise<UserJoinClass | null> {
        return await userJoinClassDao.delete(id)
    }
}
