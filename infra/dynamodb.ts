/// <reference path="../.sst/platform/config.d.ts" />

// sst.Linkable.wrap(sst.aws.Dynamo, (table) => ({
//     properties: { name: table.name },
//     include: [
//         sst.aws.permission({
//             actions: ["dynamodb:*"],
//             resources: [table.arn],
//         }),
//     ],
// }));

export const dbDynamo = new sst.aws.Dynamo('DbDynamo', {
    fields: {
        pk: 'string', // 分区键
        sk: 'string', // 排序键
        GSI1PK: 'string', // GSI1 分区键
        GSI1SK: 'string', // GSI1 排序键
        GSI2PK: 'string', // GSI2 分区键
        GSI2SK: 'string', // GSI2 排序键
        GSI3PK: 'string', // GSI3 分区键
        GSI3SK: 'string' // GSI3 排序键
    },
    primaryIndex: { hashKey: 'pk', rangeKey: 'sk' }, // 主键
    globalIndexes: {
        GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK', projection: 'all' }, // 全局二级索引
        GSI2: { hashKey: 'GSI2PK', rangeKey: 'GSI2SK', projection: 'all' }, // 全局二级索引
        GSI3: { hashKey: 'GSI3PK', rangeKey: 'GSI3SK', projection: 'all' } // 全局二级索引
    },
    ttl: 'expires' // TTL 属性
})
