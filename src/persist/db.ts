import { DynamoDBAdapter } from '@/domain/adapter-dynamodb'
import { DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'

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

export const dbAdapter = DynamoDBAdapter(dynamoClient, DB_TABLE_NAME)
