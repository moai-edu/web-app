import { DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'
import { UserDynamoAdapter } from './user_dynamo_adapter'
import { ClassDynamoAdapter } from './class_dynamo_adapter'
import { UserJoinClassDynamoAdapter } from './user_join_class_dynamo_adapter'
import { CourseQuizSubmitDynamoAdapter } from './course_quiz_submit_dynamo_adapter'

const dbConf: DynamoDBClientConfig = ['development', 'test'].includes(process.env.NODE_ENV)
    ? {
          endpoint: process.env.AWS_ENDPOINT_URL!, // LocalStack 的地址
          credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
          },
          region: process.env.AWS_REGION!
      }
    : {
          credentials: fromNodeProviderChain(), // 这里会自动获取 IAM Role 的凭证
          region: process.env.AWS_REGION!
      }

export const dynamoClient = DynamoDBDocument.from(new DynamoDB(dbConf), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
    }
})

export const DB_TABLE_NAME: string = ['test', 'development'].includes(process.env.NODE_ENV)
    ? process.env.DB_TABLE_NAME!
    : Resource.DbDynamo.name

export const userDao = UserDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const classDao = ClassDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const userJoinClassDao = UserJoinClassDynamoAdapter(dynamoClient, DB_TABLE_NAME)
export const courseQuizSubmitDao = CourseQuizSubmitDynamoAdapter(dynamoClient, DB_TABLE_NAME)
