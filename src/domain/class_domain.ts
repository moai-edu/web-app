import { classDao } from '@/persist/db'

export class ClassDomain {
    constructor() {}

    async create(_class: Class) {
        return await classDao.create(_class)
    }
}
