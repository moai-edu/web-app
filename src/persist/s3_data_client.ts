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

    async getTextContent(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })

        const response = await this.s3Client.send(command)
        const source = await response.Body?.transformToString('utf-8')
        if (!source) {
            throw new Error(`Key not found in s3 bucket: ${key}`)
        }
        return source
    }

    async getMdDataContent(key: string): Promise<{
        data: any | null | undefined
        content: string
    }> {
        // console.log('Getting markdown content for key:', key)
        const source = await this.getTextContent(key)
        const { data, content } = matter(source)
        return { data, content }
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
            expiresIn,
            signableHeaders: new Set(['Origin']) // 允许 CORS 头
        })

        // console.log('Signed url:', url)
        if (['test', 'development'].includes(process.env.NODE_ENV)) {
            // 在本地测试和本地开发环境中，返回真实 s3 URL
            // console.log('Returning real url', url)
            return url
        } else {
            // 注意：这个domain域名是用来代理s3访问的。
            // 在getSignedUrl方法中，所有生成的aws的域名都全部用这个域名替换掉，再由后者将客户端访问代理到s3的aws域名。
            // 目前使用这种办法解决aws s3域名被墙的问题。
            // 在云端dev和prod环境中部署的时候，这个环境变量的取值是不一样的，分别设置在.env.dev.sh和.env.prod.sh中，在ci-cd.yaml中加载
            if (process.env.PROXY_NGX_SERVER) {
                const domainRegex = /^https?:\/\/([^\/]+)/
                const proxy_url = url.replace(domainRegex, process.env.PROXY_NGX_SERVER)
                // console.log('Returning proxy url', proxy_url)
                return proxy_url
            } else {
                // console.error('Error: No proxy is set.', url)
                return url
            }
        }
    }

    async isFileExists(key: string): Promise<boolean> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            })
            await this.s3Client.send(command)
            return true // 文件存在
        } catch (error) {
            if ((error as { name: string }).name === 'NoSuchKey') {
                return false // 文件不存在
            }
            throw error // 其他错误
        }
    }
}
