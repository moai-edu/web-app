import { BatchWriteCommandInput, DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { User } from 'next-auth'

export function DynamoDBAdapter(client: DynamoDBDocument, tableName: string) {
    const TableName = tableName

    return {
        async createUser(user: User): Promise<User> {
            const Item = format.to({
                ...user,
                pk: `USER#${user.id}`,
                sk: `USER#${user.id}`,
                type: 'USER',
                GSI1PK: `USER#${user.email}`,
                GSI1SK: `USER#${user.email}`
            })

            await client.put({ TableName, Item })
            return user
        },

        async getUserById(id: string): Promise<User | null> {
            const { Item } = await client.get({
                TableName,
                Key: { pk: `USER#${id}`, sk: `USER#${id}` }
            })

            return format.from<User>(Item)
        },

        async getUserByEmail(email: string): Promise<User | null> {
            const { Items } = await client.query({
                TableName,
                IndexName: 'GSI1', // 使用全局二级索引查询
                KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
                ExpressionAttributeValues: {
                    ':gsi1pk': `USER#${email}`,
                    ':gsi1sk': `USER#${email}`
                }
            })

            return format.from<User>(Items?.[0])
        },

        async getUserBySlug(slug: string): Promise<User | null> {
            const { Items } = await client.query({
                TableName,
                IndexName: 'GSI2', // 使用全局二级索引查询
                KeyConditionExpression: 'GSI2PK = :gsi2pk AND GSI2SK = :gsi2sk',
                ExpressionAttributeValues: {
                    ':gsi2pk': `USER#${slug}`,
                    ':gsi2sk': `USER#${slug}`
                }
            })

            return format.from<User>(Items?.[0])
        },

        async updateUser(
            id: string,
            name: string,
            slug: string
        ): Promise<User> {
            const {
                UpdateExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues
            } = generateUpdateExpression({ name, slug })
            const newUpdateExpression = `${UpdateExpression}, GSI2PK = :gsi2pk, GSI2SK = :gsi2sk`
            ExpressionAttributeValues[':gsi2pk'] = `USER#${slug}`
            ExpressionAttributeValues[':gsi2sk'] = `USER#${slug}`

            const data = await client.update({
                TableName,
                Key: {
                    pk: `USER#${id}`,
                    sk: `USER#${id}`
                },
                UpdateExpression: newUpdateExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })

            return format.from<User>(data.Attributes)!
        },

        async deleteUser(userId: string) {
            // query all the items related to the user to delete
            const res = await client.query({
                TableName,
                KeyConditionExpression: 'pk = :pk',
                ExpressionAttributeValues: { ':pk': `USER#${userId}` }
            })
            if (!res.Items) return null
            const items = res.Items
            // find the user we want to delete to return at the end of the function call
            const user = items.find((item) => item.type === 'USER')
            const itemsToDelete = items.map((item) => {
                return {
                    DeleteRequest: {
                        Key: {
                            sk: item.sk,
                            pk: item.pk
                        }
                    }
                }
            })
            // batch write commands cannot handle more than 25 requests at once
            const itemsToDeleteMax = itemsToDelete.slice(0, 25)
            const param: BatchWriteCommandInput = {
                RequestItems: { [TableName]: itemsToDeleteMax }
            }
            await client.batchWrite(param)
            return format.from<User>(user)
        }
    }
}

// https://github.com/honeinc/is-iso-date/blob/master/index.js
const isoDateRE =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

/** Determines if a given value can be parsed into `Date` */
export function isDate(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        isoDateRE.test(value) &&
        !isNaN(Date.parse(value))
    )
}

const format = {
    /** Takes a plain old JavaScript object and turns it into a DynamoDB object */
    to(object: Record<string, unknown>) {
        const newObject: Record<string, unknown> = {}
        for (const key in object) {
            const value = object[key]
            if (value instanceof Date) {
                // DynamoDB requires the TTL attribute be a UNIX timestamp (in secs).
                if (key === 'expires') newObject[key] = value.getTime() / 1000
                else newObject[key] = value.toISOString()
            } else newObject[key] = value
        }
        return newObject
    },
    /** Takes a Dynamo object and returns a plain old JavaScript object */
    from<T = Record<string, unknown>>(
        object?: Record<string, unknown>
    ): T | null {
        if (!object) return null
        const newObject: Record<string, unknown> = {}
        for (const key in object) {
            // Filter DynamoDB specific attributes so it doesn't get passed to core,
            // to avoid revealing the type of database
            if (['pk', 'sk', 'GSI1PK', 'GSI1SK'].includes(key)) continue

            const value = object[key]

            if (isDate(value)) newObject[key] = new Date(value)
            // hack to keep type property in account
            else if (
                key === 'type' &&
                ['USER', 'COURSE'].includes(value as string)
            )
                continue
            // The expires property is stored as a UNIX timestamp in seconds, but
            // JavaScript needs it in milliseconds, so multiply by 1000.
            else if (key === 'expires' && typeof value === 'number')
                newObject[key] = new Date(value * 1000)
            else newObject[key] = value
        }
        return newObject as T
    }
}

function generateUpdateExpression(object: Record<string, unknown>): {
    UpdateExpression: string
    ExpressionAttributeNames: Record<string, string>
    ExpressionAttributeValues: Record<string, unknown>
} {
    const formattedSession = format.to(object)
    let UpdateExpression = 'set'
    const ExpressionAttributeNames: Record<string, string> = {}
    const ExpressionAttributeValues: Record<string, unknown> = {}
    for (const property in formattedSession) {
        UpdateExpression += ` #${property} = :${property},`
        ExpressionAttributeNames['#' + property] = property
        ExpressionAttributeValues[':' + property] = formattedSession[property]
    }
    UpdateExpression = UpdateExpression.slice(0, -1)
    return {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
    }
}

export { format, generateUpdateExpression }
