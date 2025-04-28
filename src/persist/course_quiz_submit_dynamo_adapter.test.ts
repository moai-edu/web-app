import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { clearTable } from '../../tests/lib/db_utils'
import { CourseQuizSubmit } from '@/domain/types'
import { courseQuizSubmitDao } from './db'
import { faker } from '@faker-js/faker'

const dao = courseQuizSubmitDao
function newMockModel(): CourseQuizSubmit {
    return {
        id: faker.string.uuid(),
        userJoinClassId: faker.string.uuid(),
        quizId: faker.helpers.slugify(faker.lorem.words(6)),
        status: 'SUBMITTED'
    }
}

describe('CourseQuizSubmitDynamoAdapter', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a CourseQuizSubmit', async () => {
        // Mock 数据
        const mock = newMockModel()
        const created = await dao.create(mock)
        expect(created).toEqual(mock)
        const existed = await dao.getById(mock.id)
        expect(existed).toEqual(mock)
    })
})
