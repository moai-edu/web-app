import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BizUser } from '@/app/_todo/domain/types'
import { DB_TABLE_NAME, dbAdapter, dynamoClient } from '@/persist/db'
import { format } from './adapter-dynamodb'

const adapter = dbAdapter
const TableName = DB_TABLE_NAME

// Mock 数据
const mockUser: BizUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'johndoe@example.com',
    slug: 'johndoe'
}

// 清理 DynamoDB 数据表
const clearTable = async () => {
    const items = await dynamoClient.scan({ TableName })
    if (items.Items) {
        for (const item of items.Items) {
            await dynamoClient.delete({
                TableName,
                Key: { pk: item.pk, sk: item.sk }
            })
        }
    }
}

describe('DynamoDBBizUserAdapter - Real DynamoDB Tests', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a BizUser', async () => {
        const createdUser = await adapter.createBizUser(mockUser)

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        console.log(result)
        expect(createdUser).toEqual(mockUser)
        expect(format.from(result.Item)).toEqual(mockUser)
    })

    it('should get a BizUser by ID', async () => {
        // 准备数据
        await adapter.createBizUser(mockUser)

        const user = await adapter.getBizUserById(mockUser.id)

        expect(user).toEqual(mockUser)
    })

    it('should get a BizUser by email', async () => {
        // 准备数据
        await adapter.createBizUser(mockUser)

        const user = await adapter.getBizUserByEmail(mockUser.email)

        expect(user).toEqual(mockUser)
    })

    it('should update a BizUser', async () => {
        // 准备数据
        await adapter.createBizUser(mockUser)

        const updatedUser = await adapter.updateBizUser({
            id: mockUser.id,
            name: 'John Updated'
        })

        expect(updatedUser.name).toEqual('John Updated')

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        expect(result.Item?.name).toEqual('John Updated')
    })

    it('should delete a BizUser', async () => {
        // 准备数据
        await adapter.createBizUser(mockUser)

        await adapter.deleteBizUser(mockUser.id)

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        expect(result.Item).toBeUndefined()
    })
})
