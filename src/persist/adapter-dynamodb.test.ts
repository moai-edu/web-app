import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DB_TABLE_NAME, dbAdapter, dynamoClient } from '@/persist/db'
import { format } from './adapter-dynamodb'
import { User } from 'next-auth'

const adapter = dbAdapter
const TableName = DB_TABLE_NAME

// Mock 数据
const mockUser: User = {
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

describe('DynamoDBAdapter - Real DynamoDB Tests', () => {
    beforeEach(async () => {
        await clearTable() // 每次测试前清空表数据
    })

    afterEach(async () => {
        await clearTable() // 每次测试后清空表数据
    })

    it('should create a User', async () => {
        const createdUser = await adapter.createUser(mockUser)

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        expect(createdUser).toEqual(mockUser)
        expect(format.from(result.Item)).toEqual(mockUser)
    })

    it('should get a User by ID', async () => {
        // 准备数据
        await adapter.createUser(mockUser)

        const user = await adapter.getUserById(mockUser.id!)

        expect(user).toEqual(mockUser)
    })

    it('should get a User by email', async () => {
        // 准备数据
        await adapter.createUser(mockUser)

        const user = await adapter.getUserByEmail(mockUser.email!)

        expect(user).toEqual(mockUser)
    })

    it('should update a User', async () => {
        // 准备数据
        await adapter.createUser(mockUser)

        const updatedUser = await adapter.updateUser(mockUser.id!, 'John Updated', 'john-updated')

        expect(updatedUser.name).toEqual('John Updated')
        expect(updatedUser.slug).toEqual('john-updated')

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        expect(result.Item?.name).toEqual('John Updated')
        expect(result.Item?.slug).toEqual('john-updated')
    })

    it('should delete a User', async () => {
        // 准备数据
        await adapter.createUser(mockUser)

        await adapter.deleteUser(mockUser.id!)

        const result = await dynamoClient.get({
            TableName,
            Key: { pk: `USER#${mockUser.id}`, sk: `USER#${mockUser.id}` }
        })

        expect(result.Item).toBeUndefined()
    })
})
