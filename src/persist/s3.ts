import S3DataClient from '@/persist/s3_data_client'
import { S3Client } from '@aws-sdk/client-s3'
import { Resource } from 'sst'
import { awsClientConfig } from './aws_config'

// 客户端配置统一来自环境变量（见 aws_config.ts）：连 LocalStack 还是连云端，
// 由代码外设置的 AWS_ENDPOINT_URL 和凭证变量决定，代码本身不再按 NODE_ENV 分支。
// 凭证不在这里显式传入，交给 SDK 默认凭证链（环境变量 → profile → IAM Role）。
export const s3Client = new S3Client(awsClientConfig())

// 桶名是同一套规则：优先环境变量（本地连 LocalStack 时在 .env.local 里设置），
// 云端没有这个变量时才回退到 SST link 注入的 Resource.DataBucket。
const DATA_BUCKET_NAME: string =
    process.env.DATA_BUCKET_NAME || Resource.DataBucket.name

export const s3DataClient = new S3DataClient(s3Client, DATA_BUCKET_NAME)
