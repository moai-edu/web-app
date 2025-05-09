import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { clearTable } from '../../tests/lib/db_utils'
import { CourseQuizSubmit } from '@/domain/types'
import { courseQuizSubmitDao } from './db'
import { faker } from '@faker-js/faker'

const dao = courseQuizSubmitDao
function newMockModel(): CourseQuizSubmit {
    const classId = faker.string.uuid()
    const userJoinClassId = faker.string.uuid()
    return {
        id: faker.string.uuid(),
        userJoinClassId,
        quizId: faker.helpers.slugify(faker.lorem.words(6)),
        classId,
        status: 'SUBMITTED',

        userJoinClass: {
            id: userJoinClassId,
            userId: faker.string.uuid(),
            classId,
            joinedAt: new Date()
        }
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
        existed!.userJoinClass = undefined
        mock!.userJoinClass = undefined
        expect(existed).toEqual(mock)
    })
})
