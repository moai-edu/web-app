import { classDao } from '@/persist/db'
import { Class } from './types'

export class ClassDomain {
    constructor() {}

    async getById(id: string): Promise<Class | null> {
        return await classDao.getById(id)
    }

    async create(userId: string, name: string, courseId: string): Promise<Class> {
        // 创建新班级
        const _class: Class = {
            id: crypto.randomUUID(),
            name,
            userId,
            courseId,
            code: crypto.randomUUID()
        }
        return await classDao.create(_class)
    }

    async getListByUserId(userId: string): Promise<Class[]> {
        return await classDao.getListByUserId(userId)
    }

    async delete(id: string) {
        return await classDao.delete(id)
    }

    async updateName(id: string, name: string): Promise<Class> {
        const _class = await classDao.getById(id)
        if (!_class) {
            throw new Error(`class id: ${id} not exist`)
        }
        return await classDao.update(id, name)
    }
}
