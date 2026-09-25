import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'
import { awsClientConfig } from './aws_config'
import { UserDynamoAdapter } from './user_dynamo_adapter'
import { ClassDynamoAdapter } from './class_dynamo_adapter'
import { UserJoinClassDynamoAdapter } from './user_join_class_dynamo_adapter'
import { CourseQuizSubmitDynamoAdapter } from './course_quiz_submit_dynamo_adapter'

// 客户端配置统一来自环境变量（见 aws_config.ts）：连 LocalStack 还是连云端，
// 由代码外设置的 AWS_ENDPOINT_URL 和凭证变量决定，代码本身不再按 NODE_ENV 分支。
// 凭证不在这里显式传入，交给 SDK 默认凭证链（环境变量 → profile → IAM Role）。
const { endpoint, region } = awsClientConfig()

export const dynamoClient = DynamoDBDocument.from(new DynamoDB({ endpoint, region }), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
    }
})

// 表名是同一套规则：优先环境变量（本地连 LocalStack 时在 .env.local 里设置），
// 云端没有这个变量时才回退到 SST link 注入的 Resource.DbDynamo。
// 用 || 而不是 ??，这样变量为空字符串时也会正确回退；且左侧有值时不会去碰 Resource。
export const DB_TABLE_NAME: string = process.env.DB_TABLE_NAME || Resource.DbDynamo.name

export const userDao = UserDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const classDao = ClassDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const userJoinClassDao = UserJoinClassDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const courseQuizSubmitDao = CourseQuizSubmitDynamoAdapter(dynamoClient, DB_TABLE_NAME)
