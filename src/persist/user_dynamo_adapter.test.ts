import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { userDao } from '@/persist/db'
import { User } from 'next-auth'
import { clearTable, getTableRecordById } from '../../tests/lib/db_utils'
import { faker } from '@faker-js/faker'

const dao = userDao

// Mock 数据
const mock: User = {
    id: faker.string.uuid(),
    name: faker.internet.username(),
    email: faker.internet.email(),
    slug: faker.helpers.slugify(faker.lorem.words(3))
}

describe('UserDynamoAdapter', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a User', async () => {
        const created = await dao.create(mock)
        const existed = await getTableRecordById('USER', mock.id!)
        expect(created).toEqual(mock)
        expect(existed).toEqual(mock)
    })

    it('should get a User by ID', async () => {
        await dao.create(mock)
        const user = await dao.getById(mock.id!)
        expect(user).toEqual(mock)
    })

    it('should get a User by email', async () => {
        await dao.create(mock)
        const user = await dao.getByEmail(mock.email!)
        expect(user).toEqual(mock)
    })

    it('should update a User', async () => {
        await dao.create(mock)
        const updatedUser = await dao.update(mock.id!, 'John Updated', 'john-updated')
        expect(updatedUser.name).toEqual('John Updated')
        expect(updatedUser.slug).toEqual('john-updated')

        const existed = await getTableRecordById('USER', mock.id!)
        expect(existed!.name).toEqual('John Updated')
        expect(existed!.slug).toEqual('john-updated')
    })

    it('should delete a User', async () => {
        await dao.create(mock)
        await dao.delete(mock.id!)
        const existed = await getTableRecordById('USER', mock.id!)
        expect(existed).toBeNull()
    })
})
