import { DB_TABLE_NAME, dynamoClient } from '@/persist/db'
import { DaoFormat } from '@/persist/utils'

const TableName = DB_TABLE_NAME

// 清理 DynamoDB 数据表
export const clearTable = async () => {
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

export const getTableRecordById = async (table: string, id: string) => {
    const result = await dynamoClient.get({
        TableName,
        Key: { pk: `${table}#${id}`, sk: `${table}#${id}` }
    })
    return DaoFormat.from(result.Item)
}
