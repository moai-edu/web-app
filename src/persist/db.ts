import { DynamoDBBizUserAdapter } from '@/app/domain/adapter-dynamodb'
import { DynamoDB, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'

const authDbConf: DynamoDBClientConfig = ['development', 'test'].includes(
    process.env.NODE_ENV
)
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

export const dynamoClient = DynamoDBDocument.from(new DynamoDB(authDbConf), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
    }
})

export const AUTH_TABLE_NAME: string = ['test', 'development'].includes(
    process.env.NODE_ENV
)
    ? process.env.AUTH_TABLE_NAME!
    : Resource.NextAuthDynamo.name

export const BIZ_TABLE_NAME: string = ['test', 'development'].includes(
    process.env.NODE_ENV
)
    ? process.env.BIZ_TABLE_NAME!
    : Resource.BizDataDynamo.name

export const bizAdapter = DynamoDBBizUserAdapter(dynamoClient, BIZ_TABLE_NAME)
