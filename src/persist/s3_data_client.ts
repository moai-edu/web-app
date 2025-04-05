import { CourseStep } from '@/domain/types'
import { extractResourceFromMdLine, getAbsFilePath } from '@/lib/md_utils'
import { S3Client } from '@aws-sdk/client-s3'
import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import matter from 'gray-matter'

interface Metadata {
    access?: string // 假设 access 是一个可选的字符串属性
    // 其他可能存在的属性
}

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

    async listFiles(prefix: string): Promise<string[]> {
        // 列出 S3 存储桶中的所有对象
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix
        })
        const response = await this.s3Client.send(command)

        // 获取所有图片文件的 Key
        const resFiles = response.Contents?.filter((file) => file.Key?.match(/\.(jpg|jpeg|png|md)$/i)) || []
        return resFiles.map((file) => file.Key!)
    }

    async getMdContent(key: string): Promise<{
        metadata: Metadata
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

    async getMetadataSteps(entryMdFilePath: string): Promise<{ metadata: Metadata; steps: CourseStep[] }> {
        // 获取入口文件原始的 markdown 文本
        const { metadata, content } = await this.getMdContent(entryMdFilePath)

        // 解析一级标题，将内容分成steps数组
        const steps = this.getStepsFromContent(content)
        return { metadata, steps }
    }

    /**
     * 从markdown 文件的内容中，查找所有被引用的资源在s3 bucket中的路径，返回资源引用路径全部由s3 signed url替换以后的markdown文本；
     *
     * 注意：
     * - markdown文本中每行最多有一个资源，不需要考虑一行有多个资源文件的情况；
     * - getSignedUrl方法接收1个参数，即资源文件的s3路径，返回该资源文件的 s3 signed url，并且该方法是一个asnyc方法，需要await调用。
     *
     * @param entryFileDir markdown文件所在目录的路径
     * @param mdContent markdown文本内容
     * @returns 资源引用路径全部被s3 signed url替换以后的markdown文本
     */
    async replaceResUrlsWithS3SignedUrls(entryFileDir: string, mdContent: string): Promise<string> {
        const mdLines = []
        const lines = mdContent.split('\n')
        for (const line of lines) {
            let mdLine = line
            const res = extractResourceFromMdLine(line)
            if (res) {
                const s3FilePath = getAbsFilePath(entryFileDir, res)
                const signedUrl = await this.getSignedUrl(s3FilePath)
                mdLine = line.replace(res, signedUrl)
            }
            mdLines.push(mdLine)
        }
        return mdLines.join('\n')
    }

    /**
     * 从markdown文本中解析出1级标题，并将内容按1级标题分成steps数组，每个step包含name, description和content属性
     * 每个1级标题是一个step，其内容如下：
     * - 从标题行中解析设置step的name和descrition：# 标题名{可选的description}，其中标题名为step的name属性，可选的description为step的description属性
     * - 从内容行中设置step的content：标题行以及标题行下面的内容，直到下一个一级标题或文件末尾；如果标题行在标题名name的后面还有可选的属性，比如：{可选的description}，则将可选属性从内容中移除
     * - 示例：
     *   # Step 1{This is the first step}
     *   content of step 1
     *   # Step 2{This is the second step}
     *   Content of step 2
     *   # Step 3{This is the third step}
     *   # Step 2
     *   Content of step 2
     *   # Step 3
     *   Content of step 3
     *   # Summary
     *   Conclusion of the course
     * @param content markdown文本
     * @returns steps数组
     */
    getStepsFromContent(content: string): CourseStep[] {
        // 将内容按一级标题分割
        const sections = content.split(/(?=^# )/m)
        // 过滤掉空白部分并处理每个部分
        return sections
            .filter((section) => section.trim())
            .map((section) => {
                // 获取第一行作为标题行
                const firstLineEnd = section.indexOf('\n')
                const titleLine = section.slice(0, firstLineEnd).trim()
                const restContent = section.slice(firstLineEnd + 1)

                // 解析标题行中的name和description
                const titleMatch = titleLine.match(/^# (.*?)(?:\{(.*?)\})?$/)
                if (!titleMatch) {
                    return {
                        name: titleLine.replace(/^# /, ''),
                        description: '',
                        content: section.trim()
                    }
                }

                const [, name, description = ''] = titleMatch

                // 如果标题行包含description,需要从content中移除
                const content = `# ${name}\n${restContent}`.trim()

                const step: CourseStep = {
                    name: name.trim(),
                    description: description.trim(),
                    content
                }
                return step
            })
    }
}
