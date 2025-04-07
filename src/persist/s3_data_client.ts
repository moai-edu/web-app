import { CourseMetadata } from '@/domain/types'
import { S3Client } from '@aws-sdk/client-s3'
import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import matter from 'gray-matter'

export default class S3DataClient {
    s3Client: S3Client
    bucketName: string
    constructor(client: S3Client, bucketName: string) {
        this.bucketName = bucketName
        this.s3Client = client
    }

    async uploadFile(file: File, key: string): Promise<void> {
        const buffer = Buffer.from(await file.arrayBuffer())

        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.type // 文件类型
        }
        await this.s3Client.send(new PutObjectCommand(params))
    }

    async listFiles(prefix: string, suffix: string): Promise<string[]> {
        // 列出 S3 存储桶中的所有对象
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix
        })
        const response = await this.s3Client.send(command)

        // 获取所有index.md文件的 Key
        const resFiles = response.Contents?.filter((file) => file.Key?.endsWith(suffix)) || []
        return resFiles.map((file) => file.Key!)
    }

    async getMdContent(key: string): Promise<{
        metadata: CourseMetadata
        content: string
    }> {
        // console.log('Getting markdown content for key:', key)
        // 获取 markdown 文件的内容
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })
        const response = await this.s3Client.send(command)
        const source = await response.Body?.transformToString('utf-8')
        if (!source) {
            throw new Error(`Key not found in s3 bucket: ${key}`)
        }
        const { data: metadata, content } = matter(source)
        return { metadata, content }
    }

    async getSignedUrl(key: string): Promise<string> {
        // console.log('Getting signed url for key:', key)
        const expiresIn = 60 * 5 // 5 minutes
        // 获取图片的签名 URL
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn
        })
        return url
    }
}
