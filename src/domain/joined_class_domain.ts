import { userJoinClassDao } from '@/persist/db'
import { UserJoinClass } from './types'

export class UserJoinClassDomain {
    constructor() {}

    async create(userId: string, name: string, classId: string): Promise<UserJoinClass> {
        // 创建新班级
        const join: UserJoinClass = {
            id: crypto.randomUUID(),
            userId,
            classId,
            joinedAt: new Date()
        }
        return await userJoinClassDao.create(join)
    }

    async getListByUserId(userId: string): Promise<UserJoinClass[]> {
        return await userJoinClassDao.getListByUserId(userId)
    }

    async getListByClassId(classId: string): Promise<UserJoinClass[]> {
        return await userJoinClassDao.getListByClassId(classId)
    }

    async delete(id: string) {
        return await userJoinClassDao.delete(id)
    }
}
