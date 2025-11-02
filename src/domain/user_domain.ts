import { User } from 'next-auth'
import { userDao } from '@/persist/db'

export class UserDomain {
    constructor() {}

    async getBySlug(slug: string): Promise<User | null> {
        return await userDao.getBySlug(slug)
    }

    async update(id: string, name: string, slug: string): Promise<User> {
        return await userDao.update(id, name, slug)
    }
}
