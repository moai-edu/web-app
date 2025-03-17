/// <reference path="../.sst/platform/config.d.ts" />

export const nextAuthTable = new sst.aws.Dynamo("NextAuth", {
    fields: {
        pk: "string", // 分区键
        sk: "string", // 排序键
        GSI1PK: "string", // GSI1 分区键
        GSI1SK: "string", // GSI1 排序键
    },
    primaryIndex: { hashKey: "pk", rangeKey: "sk" }, // 主键
    globalIndexes: {
        GSI1: { hashKey: "GSI1PK", rangeKey: "GSI1SK", projection: "all" }, // 全局二级索引
    },
    ttl: "expires", // TTL 属性
});
