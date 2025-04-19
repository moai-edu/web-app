import { classDao } from '@/persist/db'
import { Class } from './types'

export class ClassDomain {
    constructor() {}

    async create(_class: Class) {
        return await classDao.create(_class)
    }

    async getListByUserId(userId: string) {
        return await classDao.getListByUserId(userId)
    }
}
