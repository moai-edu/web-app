import { DB_TABLE_NAME, dynamoClient } from '@/persist/db'

const TableName = DB_TABLE_NAME

// 清理 DynamoDB 数据表
export const clearTable = async () => {
    // console.log(`clearTable: ${TableName}`)
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
