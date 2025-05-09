import { BatchWriteCommandInput, DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DaoFormat, generateUpdateExpression, RECORD_PREFIX } from './utils'

type DaoType = (typeof RECORD_PREFIX)[number]

export default class Dao {
    client: DynamoDBDocument
    tableName: string
    type: DaoType

    constructor(client: DynamoDBDocument, tableName: string, type: DaoType) {
        this.tableName = tableName
        this.client = client
        this.type = type
    }

    async create(obj: any) {
        const Item = DaoFormat.to({
            ...obj,
            pk: `${this.type}#${obj.id}`,
            sk: `${this.type}#${obj.id}`,
            type: this.type
        })

        await this.client.put({ TableName: this.tableName, Item })
    }

    async createWithGSI1(obj: any, idGSI1: string) {
        const Item = DaoFormat.to({
            ...obj,
            pk: `${this.type}#${obj.id}`,
            sk: `${this.type}#${obj.id}`,
            type: this.type,
            GSI1PK: `${this.type}#${idGSI1}`,
            GSI1SK: `${this.type}#${idGSI1}`
        })

        await this.client.put({ TableName: this.tableName, Item })
    }

    async createWithGSI12(obj: any, idGSI1: string, idGSI2: string) {
        const Item = DaoFormat.to({
            ...obj,
            pk: `${this.type}#${obj.id}`,
            sk: `${this.type}#${obj.id}`,
            type: this.type,
            GSI1PK: `${this.type}#${idGSI1}`,
            GSI1SK: `${this.type}#${idGSI1}`,
            GSI2PK: `${this.type}#${idGSI2}`,
            GSI2SK: `${this.type}#${idGSI2}`
        })

        await this.client.put({ TableName: this.tableName, Item })
    }

    async createWithGSI123(obj: any, idGSI1: string, idGSI2: string， idGSI3: string) {
        const Item = DaoFormat.to({
            ...obj,
            pk: `${this.type}#${obj.id}`,
            sk: `${this.type}#${obj.id}`,
            type: this.type,
            GSI1PK: `${this.type}#${idGSI1}`,
            GSI1SK: `${this.type}#${idGSI1}`,
            GSI2PK: `${this.type}#${idGSI2}`,
            GSI2SK: `${this.type}#${idGSI2}`,
            GSI3PK: `${this.type}#${idGSI3}`,
            GSI3SK: `${this.type}#${idGSI3}`
        })

        await this.client.put({ TableName: this.tableName, Item })
    }

    async getById<T>(id: string): Promise<T | null> {
        const { Item } = await this.client.get({
            TableName: this.tableName,
            Key: { pk: `${this.type}#${id}`, sk: `${this.type}#${id}` }
        })

        return DaoFormat.from<T>(Item)
    }

    async getByGSI1<T>(idGSI1: string): Promise<T | null> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI1', // 使用全局二级索引查询
            KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
            ExpressionAttributeValues: {
                ':gsi1pk': `${this.type}#${idGSI1}`,
                ':gsi1sk': `${this.type}#${idGSI1}`
            }
        })

        return Items?.[0] ? DaoFormat.from<T>(Items[0]) : null
    }

    async getByGSI2<T>(idGSI2: string): Promise<T | null> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI2', // 使用全局二级索引查询
            KeyConditionExpression: 'GSI2PK = :gsi2pk AND GSI2SK = :gsi2sk',
            ExpressionAttributeValues: {
                ':gsi2pk': `${this.type}#${idGSI2}`,
                ':gsi2sk': `${this.type}#${idGSI2}`
            }
        })

        return Items?.[0] ? DaoFormat.from<T>(Items[0]) : null
    }

    async getByGSI3<T>(idGSI3: string): Promise<T | null> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI3', // 使用全局二级索引查询
            KeyConditionExpression: 'GSI3PK = :gsi3pk AND GSI3SK = :gsi3sk',
            ExpressionAttributeValues: {
                ':gsi3pk': `${this.type}#${idGSI3}`,
                ':gsi3sk': `${this.type}#${idGSI3}`
            }
        })

        return Items?.[0] ? DaoFormat.from<T>(Items[0]) : null
    }

    async update<T>(id: string, updateValues: Partial<T>): Promise<T> {
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
            generateUpdateExpression(updateValues)

        const data = await this.client.update({
            TableName: this.tableName,
            Key: {
                pk: `${this.type}#${id}`,
                sk: `${this.type}#${id}`
            },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        })

        return DaoFormat.from<T>(data.Attributes)!
    }

    async updateWithGSI1<T>(id: string, updateValues: Partial<T>, valueGSI1: string): Promise<T> {
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
            generateUpdateExpression(updateValues)
        let gsiUpdateExpression = `${UpdateExpression}, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk`
        ExpressionAttributeValues[':gsi1pk'] = `${this.type}#${valueGSI1}`
        ExpressionAttributeValues[':gsi1sk'] = `${this.type}#${valueGSI1}`

        const record = await this.client.update({
            TableName: this.tableName,
            Key: {
                pk: `${this.type}#${id}`,
                sk: `${this.type}#${id}`
            },
            UpdateExpression: gsiUpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        })

        return DaoFormat.from<T>(record.Attributes)!
    }

    async updateWithGSI2<T>(id: string, updateValues: Partial<T>, valueGSI2: string): Promise<T> {
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
            generateUpdateExpression(updateValues)
        let gsiUpdateExpression = `${UpdateExpression}, GSI2PK = :gsi2pk, GSI2SK = :gsi2sk`
        ExpressionAttributeValues[':gsi2pk'] = `${this.type}#${valueGSI2}`
        ExpressionAttributeValues[':gsi2sk'] = `${this.type}#${valueGSI2}`

        const record = await this.client.update({
            TableName: this.tableName,
            Key: {
                pk: `${this.type}#${id}`,
                sk: `${this.type}#${id}`
            },
            UpdateExpression: gsiUpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        })

        return DaoFormat.from<T>(record.Attributes)!
    }

    async updateWithGSI12<T>(
        id: string,
        updateValues: Partial<T>,
        valueGSI1: string,
        valueGSI2: string | undefined
    ): Promise<T> {
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
            generateUpdateExpression(updateValues)
        let gsiUpdateExpression = `${UpdateExpression}, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, GSI2PK = :gsi2pk, GSI2SK = :gsi2sk`
        ExpressionAttributeValues[':gsi1pk'] = `${this.type}#${valueGSI1}`
        ExpressionAttributeValues[':gsi1sk'] = `${this.type}#${valueGSI1}`
        ExpressionAttributeValues[':gsi2pk'] = `${this.type}#${valueGSI2}`
        ExpressionAttributeValues[':gsi2sk'] = `${this.type}#${valueGSI2}`

        const record = await this.client.update({
            TableName: this.tableName,
            Key: {
                pk: `${this.type}#${id}`,
                sk: `${this.type}#${id}`
            },
            UpdateExpression: gsiUpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        })

        return DaoFormat.from<T>(record.Attributes)!
    }

    async delete<T>(id: string): Promise<T | null> {
        // query all the items related to the user to delete
        const res = await this.client.query({
            TableName: this.tableName,
            KeyConditionExpression: 'pk = :pk AND sk = :sk',
            ExpressionAttributeValues: { ':pk': `${this.type}#${id}`, ':sk': `${this.type}#${id}` }
        })
        if (!res.Items) return null
        const items = res.Items
        // find the user we want to delete to return at the end of the function call
        const record = items.find((item) => item.type === this.type)
        if (!record) return null
        const itemsToDelete = [
            {
                DeleteRequest: {
                    Key: {
                        sk: record.sk,
                        pk: record.pk
                    }
                }
            }
        ]
        // batch write commands cannot handle more than 25 requests at once
        const itemsToDeleteMax = itemsToDelete.slice(0, 25)
        const param: BatchWriteCommandInput = {
            RequestItems: { [this.tableName]: itemsToDeleteMax }
        }
        await this.client.batchWrite(param)
        return DaoFormat.from<T>(record)
    }

    async getListByGSI1<T>(idGSI1: string): Promise<T[]> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
            ExpressionAttributeValues: {
                ':gsi1pk': `${this.type}#${idGSI1}`,
                ':gsi1sk': `${this.type}#${idGSI1}`
            }
        })
        return Items ? Items.map((item) => DaoFormat.from<T>(item)!).filter(Boolean) : []
    }

    async getListByGSI2<T>(idGSI2: string): Promise<T[]> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI2',
            KeyConditionExpression: 'GSI2PK = :gsi2pk AND GSI2SK = :gsi2sk',
            ExpressionAttributeValues: {
                ':gsi2pk': `${this.type}#${idGSI2}`,
                ':gsi2sk': `${this.type}#${idGSI2}`
            }
        })
        return Items ? Items.map((item) => DaoFormat.from<T>(item)!).filter(Boolean) : []
    }

    async getListByGSI3<T>(idGSI3: string): Promise<T[]> {
        const { Items } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'GSI3',
            KeyConditionExpression: 'GSI3PK = :gsi3pk AND GSI3SK = :gsi3sk',
            ExpressionAttributeValues: {
                ':gsi3pk': `${this.type}#${idGSI3}`,
                ':gsi3sk': `${this.type}#${idGSI3}`
            }
        })
        return Items ? Items.map((item) => DaoFormat.from<T>(item)!).filter(Boolean) : []
    }
}
