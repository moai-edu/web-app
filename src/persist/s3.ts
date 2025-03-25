import S3DataClient from '@/persist/s3_data_client'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import { Resource } from 'sst'

const DATA_BUCKET_NAME: string = ['test', 'development'].includes(
    process.env.NODE_ENV
)
    ? process.env.DATA_BUCKET_NAME!
    : Resource.DataBucket.name

let conf: S3ClientConfig = {}
if (['test', 'development'].includes(process.env.NODE_ENV)) {
    conf = {
        endpoint: process.env.AWS_ENDPOINT_URL, // LocalStack 的地址
        region: process.env.AWS_REGION, // 区域
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!, // 访问密钥
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! // 秘密密钥
        },
        forcePathStyle: true // 使用路径样式访问
    }
} else {
    //ci环境下使用环境变量
    conf = {}
}

export const s3Client = new S3Client(conf)

export const s3DataClient = new S3DataClient(s3Client, DATA_BUCKET_NAME)
