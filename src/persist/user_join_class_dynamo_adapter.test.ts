import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { clearTable } from '../../tests/lib/db_utils'
import { UserJoinClass } from '@/domain/types'
import { userJoinClassDao } from './db'
import { faker } from '@faker-js/faker'

const dao = userJoinClassDao
function newMockClass(): UserJoinClass {
    return {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        classId: faker.string.uuid(),
        joinedAt: faker.date.recent()
    }
}

describe('UserJoinClassDynamoAdapter', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a UserJoinClass', async () => {
        // Mock 数据
        const mock = newMockClass()
        const created = await dao.create(mock)
        expect(created).toEqual(mock)
        const existed = await dao.getById(mock.id)
        expect(existed).toEqual(mock)
    })

    it('should get a UserJoinClass by ID', async () => {
        const mock = newMockClass()
        await dao.create(mock)
        const existed = await dao.getById(mock.id!)
        expect(existed).toEqual(mock)
    })

    it('should get list by user id', async () => {
        // Mock 数据
        const userId = faker.string.uuid()
        const mockClasses = Array.from({ length: 10 }, (_, i) => ({
            id: faker.string.uuid(),
            userId: i < 5 ? userId : faker.string.uuid(), // 部分相同userId,部分用不同的
            classId: faker.string.uuid(),
            joinedAt: faker.date.recent()
        }))
        // 批量创建测试数据
        await Promise.all(mockClasses.map((mock) => dao.create(mock)))
        const list = await dao.getListByUserId(userId)
        expect(list.length).toBe(5) // 验证长度为2
        expect(list).toEqual(expect.arrayContaining(mockClasses.slice(0, 5))) // 验证包含元素,不考虑顺序
        expect(list.every((item) => item.userId === userId)).toBe(true) // 验证所有返回的class的userId都是正确的
    })

    it('should get list by class id', async () => {
        // Mock 数据
        const classId = faker.string.uuid()
        const mockClasses = Array.from({ length: 10 }, (_, i) => ({
            id: faker.string.uuid(),
            userId: faker.string.uuid(),
            classId: i < 5 ? classId : faker.string.uuid(), // 部分相同classId,部分用不同的
            joinedAt: faker.date.recent()
        }))
        // 批量创建测试数据
        await Promise.all(mockClasses.map((mock) => dao.create(mock)))
        const list = await dao.getListByClassId(classId)
        expect(list.length).toBe(5) // 验证长度为2
        expect(list).toEqual(expect.arrayContaining(mockClasses.slice(0, 5))) // 验证包含元素,不考虑顺序
        expect(list.every((item) => item.classId === classId)).toBe(true) // 验证所有返回的class的classId都是正确的
    })

    it('should delete a Class', async () => {
        const mock = newMockClass()
        await dao.create(mock)
        await dao.delete(mock.id!)
        const existed = await dao.getById(mock.id!)
        expect(existed).toBeNull()
    })
})
