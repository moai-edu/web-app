import { CourseStep } from '@/app/domain/types'
import { S3Client } from '@aws-sdk/client-s3'
import {
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import matter from 'gray-matter'
import path from 'path'

const RES_FILE_EXTS: Set<string> = new Set([
    'pdf',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'webp',
    'mp4'
])

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
        const resFiles =
            response.Contents?.filter((file) =>
                file.Key?.match(/\.(jpg|jpeg|png|md)$/i)
            ) || []
        return resFiles.map((file) => file.Key!)
    }

    async getMdContent(key: string): Promise<{
        metadata: Metadata
        content: string
    }> {
        console.log('Getting markdown content for key:', key)
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
        console.log('Getting signed url for key:', key)
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

    async getMetadataSteps(
        entryMdFilePath: string
    ): Promise<{ metadata: Metadata; steps: CourseStep[] }> {
        // 获取入口文件原始的 markdown 文本
        const { metadata, content } = await this.getMdContent(entryMdFilePath)

        // 解析一级标题，将内容分成steps数组
        const steps = this.getStepsFromContent(content)
        return { metadata, steps }
    }

    /**
     * 从参数entryFilePath指定的markdown 文件的内容中，查找所有被引用的资源在s3 bucket中的路径，返回资源引用路径全部由s3 signed url替换以后的markdown文本；如果没有任何资源路径需要替换，则返回原始的 markdown 文本。
     *
     * entryFileDir为入口markdown文件所在的绝对目录路径，用于计算相对路径资源引用的绝对路径。
     *
     * 被引用资源在s3 bucket中的路径按如下规则计算：
     * - 如果路径本身就是以反斜杠开头的绝对路径，则直接返回。例如：/sample.pdf -> /sample.pdf；
     * - 如果路径是相对路径，则相对于目录entryFileDir计算绝对路径，然后计算出资源文件在s3 bucket中的路径，要求最后返回的s3 bucket中的路径中不包含任何 "." 或 ".." 符号，例如：
     *   - 对于参数 entryFileDir 为 "/foo/bar"，路径"./sample.pdf"的s3路径计算结果为："/foo/bar/sample.pdf"；
     *   - 对于参数 entryFileDir 为 "/foo/bar"，路径"../sample.pdf"的s3路径计算结果为："/foo/sample.pdf"；
     *   - 对于参数 entryFileDir 为 "/foo/bar"，路径"../../sample.pdf"的s3路径计算结果为："/sample.pdf"；
     *
     * markdown所引用的资源类型有以下3种（以下假设entryFileDir="/foo/bar"）：
     * - 链接引用：[A sample pdf](./sample.pdf) ，先算出s3路径：/foo/bar/sample.pdf，再将./sample.pdf替换为/foo/bar/sample.pdf的s3 signed url
     * - 图片绝对路径引用：![A sample png](/sample.png) ，先算出s3路径：/sample.png，再将/sample.png替换为sample.png的s3 signed url
     * - 图片相对路径引用：![A sample png](./sample.png)，先算出s3路径：/foo/bar/sample.png，再将./sample.png替换为/foo/bar/sample.png的s3 signed url
     * - 背景图片：# My Slide {data-background-image=../sample.png data-background-size=contain} ，先算出s3路径：/foo/sample.png，再将../sample.png替换为/foo/sample.png的s3 signed url
     *
     * 以一个资源文件的绝对路径为参数，调用this.getSignedUrl(key: string)方法即可以返回该资源文件对应的 s3 signed url，并替换 markdown 文本中的原始路径为 s3 signed url。
     *
     * 注意：
     * - markdown文本中每行最多有一个资源，不需要考虑一行有多个资源文件的情况；
     * - markdown 文本中所引用的资源文件必须存在后缀名，且后缀名必须在 RES_FILE_EXTS 中，否则会被忽略，不替换。
     * - getSignedUrl方法接收1个参数，即资源文件的s3路径，返回该资源文件的 s3 signed url，并且该方法是一个asnyc方法，需要await调用。
     *
     * 算法：
     *
     * @param entryFileDir markdown文件在s3 bucket中目录的绝对路径
     * @returns 资源引用路径全部被s3 signed url替换以后的入口markdown文本，按一级标题分成steps数组，每个step包含name, descript和content属性
     */
    async replaceResUrlsWithS3SignedUrls(
        entryFileDir: string,
        mdContent: string
    ): Promise<string> {
        //
        return mdContent
        // // 计算所有图片文件的 s3 路径，这个代码有问题！！！！需要重写！！！

        // 计算入口文件所在的目录
        // const entryFileDir = path.dirname(entryMdFilePath)

        // // 将所引用资源的路径用signed-url替换
        // // 正则匹配三种资源引用方式
        // const resourcePattern =
        //     /(!?\[.*?\]\()(.+?)(\))|(\{.*?data-background-image=(.*?)\s.*?\})/g

        // const replacePromises: Promise<{
        //     original: string
        //     replaced: string
        // }>[] = []

        // content.replace(
        //     resourcePattern,
        //     (match, _, linkPath, __, backgroundMatch, backgroundPath) => {
        //         const filePath = linkPath || backgroundPath
        //         if (!filePath) return match

        //         // 计算 S3 存储路径
        //         let s3FilePath: string
        //         if (filePath.startsWith('/')) {
        //             s3FilePath = filePath.slice(1) // 移除开头的斜杠
        //         } else {
        //             s3FilePath = path
        //                 .join(entryFileDir, filePath)
        //                 .replace(/\\/g, '/')
        //         }

        //         // 解析相对路径，确保无 "." 和 ".."
        //         s3FilePath = path
        //             .normalize(s3FilePath)
        //             .replace(/\\/g, '/')
        //             .replace(/^\.\//, '')

        //         // 仅处理允许的文件类型
        //         const ext = s3FilePath.split('.').pop()?.toLowerCase()
        //         if (!ext || !RES_FILE_EXTS.has(ext)) return match

        //         // 异步获取 signed URL
        //         replacePromises.push(
        //             this.getS3SignedUrl(s3FilePath).then((signedUrl) => ({
        //                 original: filePath,
        //                 replaced: signedUrl
        //             }))
        //         )

        //         return match
        //     }
        // )

        // const replacements = await Promise.all(replacePromises)
        // for (const { original, replaced } of replacements) {
        //     content = mdContent.replace(original, replaced)
        // }
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
