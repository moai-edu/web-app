import { classDao, userDao, userJoinClassDao } from '@/persist/db'
import { Class, UserJoinClass } from './types'

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

    async getListByUserId(userId: string): Promise<Class[]> {
        const joinedClasses = await userJoinClassDao.getListByUserId(userId)
        const classPromises = joinedClasses.map(async (joinedClass) => {
            return await classDao.getById(joinedClass.classId)
        })

        // 等待所有Promise完成，并过滤掉null值
        const classes = await Promise.all(classPromises)
        return classes.filter((classObj) => classObj !== null)
    }

    async getListByClassId(classId: string): Promise<UserJoinClass[]> {
        return await userJoinClassDao.getListByClassId(classId)
    }

    async leave(userId: string, idClass: string): Promise<UserJoinClass | null> {
        const joinedClasses = await userJoinClassDao.getListByUserId(userId)
        const joinedClass = joinedClasses.find((c) => c.classId === idClass)
        if (joinedClass) {
            return await userJoinClassDao.delete(joinedClass.id)
        } else {
            return null
        }
    }

    async getCourseUrlById(id: string): Promise<string> {
        const _class = await classDao.getById(id)
        const user = await userDao.getById(_class!.userId)
        return `/u/${user!.slug}/course/${_class!.courseId}`
    }
}
