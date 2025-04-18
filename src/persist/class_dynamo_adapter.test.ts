import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { clearTable, getTableRecordById } from '../../tests/lib/db_utils'
import { Class } from '@/domain/types'
import { classDao } from './db'
import { faker } from '@faker-js/faker'

const dao = classDao
function newMockClass(): Class {
    return {
        id: faker.string.uuid(),
        name: faker.word.sample(),
        userId: faker.string.uuid(),
        courseId: faker.helpers.slugify(faker.lorem.words(3))
    }
}

describe('ClassDynamoAdapter', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a Class', async () => {
        // Mock 数据
        const mock = newMockClass()
        const created = await dao.create(mock)
        expect(created).toEqual(mock)
        const existed = await getTableRecordById('CLASS', mock.id)
        expect(existed).toEqual(mock)
    })

    it('should get a User by ID', async () => {
        const mock = newMockClass()
        await dao.create(mock)
        const existed = await dao.getById(mock.id!)
        expect(existed).toEqual(mock)
    })

    it('should get Class list by user id', async () => {
        // Mock 数据
        const userId = faker.string.uuid()
        const mockClasses = Array.from({ length: 3 }, (_, i) => ({
            id: faker.string.uuid(),
            name: faker.internet.username(),
            userId: i < 2 ? userId : faker.string.uuid(), // 前两个用相同userId,最后一个用不同的
            courseId: faker.helpers.slugify(faker.lorem.words(3))
        }))
        // 批量创建测试数据
        await Promise.all(mockClasses.map((mock) => dao.create(mock)))
        const list = await dao.getListByUserId(userId)
        expect(list.length).toBe(2) // 验证长度为2
        expect(list).toEqual(expect.arrayContaining(mockClasses.slice(0, 2))) // 验证包含前两个元素,不考虑顺序
        expect(list.every((item) => item.userId === userId)).toBe(true) // 验证所有返回的class的userId都是正确的
    })

    it('should update a class', async () => {
        const mock = newMockClass()
        await dao.create(mock)

        const name = faker.word.sample()
        const courseId = faker.helpers.slugify(faker.lorem.words(3))
        const updated = await dao.update(mock.id!, name, courseId)
        expect(updated.name).toEqual(name)
        expect(updated.courseId).toEqual(courseId)

        const existed = await getTableRecordById('CLASS', mock.id!)
        expect(existed!.name).toEqual(name)
        expect(existed!.courseId).toEqual(courseId)
    })
})
