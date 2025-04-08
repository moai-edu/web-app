import { DynamoDBAdapter } from '@/persist/adapter-dynamodb'
import { dbAdapter } from '@/persist/db'
import { s3DataClient } from '@/persist/s3'
import S3DataClient from '@/persist/s3_data_client'
import { Course, CourseMetadata, CourseStep, Unit } from './types'
import { extractResourceFromMdLine, getAbsFilePath } from '@/lib/md_utils'

export class CourseDomain {
    s3DataClient: S3DataClient
    dbAdapter: DynamoDBAdapter
    // Normal signature with defaults
    constructor() {
        this.s3DataClient = s3DataClient
        this.dbAdapter = dbAdapter
    }

    /**
     * 获取指定用户的课程列表
     *
     * 查找s3 bucket中`docs/${slug}/course`目录下的所有子目录，每个子目录都是一个course，返回course列表。
     * course的id属性为子目录的名称，title、description、cover属性可直接从index.md文件中frontmatter中获取，如果frontmatter不存在，则全部设置为空字符串。
     *
     * 如果course目录不存在，返回空列表；
     * 如果course目录下的课程子目录中不存在index.md文件，忽略这个课程子目录，处理下一个子目录；
     *
     * @param slug - 用户的专属URL标识
     * @returns 返回课程列表数组,如果没有找到则返回空列表。
     */
    async getCourseList(slug: string): Promise<Course[]> {
        const courseDir = `docs/${slug}/course/`
        try {
            // 列出课程目录下的所有文件
            const files = await this.s3DataClient.listFiles(courseDir, 'index.md')
            if (!files || files.length === 0) return []
            // 获取所有课程子目录
            const courseDirs = new Set(
                files
                    .map((file) => {
                        const relativePath = file.substring(courseDir.length)
                        return relativePath.split('/')[0]
                    })
                    .filter((dir) => dir) // 过滤空字符串
            )

            const courses: Course[] = []

            // 遍历每个课程子目录
            for (const dir of courseDirs) {
                const indexMdPath = `${courseDir}${dir}/index.md`

                // 检查是否存在index.md文件
                if (!files.includes(indexMdPath)) continue

                try {
                    // 读取index.md文件内容
                    const { metadata } = await this.s3DataClient.getMdContent(indexMdPath)
                    let coverUrl = ''
                    if (metadata.cover) {
                        const coverKey = `${courseDir}${dir}/${metadata.cover}`
                        coverUrl = await this.s3DataClient.getSignedUrl(coverKey)
                    }
                    courses.push({
                        id: dir,
                        title: metadata.title || '',
                        description: metadata.description || '',
                        cover: coverUrl
                    })
                } catch (error) {
                    console.error(`Error processing course ${dir}:`, error)
                    continue
                }
            }

            return courses
        } catch (error) {
            console.error('Error getting course list:', error)
            return []
        }
    }

    async getCourse(slug: string, courseId: string): Promise<Course | null> {
        const units: Unit[] = [
            {
                unitNumber: 1,
                description: 'Form basic sentences, greet people',
                backgroundColor: 'bg-[#58cc02]',
                textColor: 'text-[#58cc02]',
                borderColor: 'border-[#46a302]',
                tiles: [
                    {
                        type: 'star',
                        description: 'Form basic sentences'
                    },
                    {
                        type: 'book',
                        description: 'Good morning'
                    },
                    {
                        type: 'star',
                        description: 'Greet people'
                    },
                    { type: 'treasure' },
                    { type: 'book', description: 'A date' },
                    { type: 'trophy', description: 'Unit 1 review' }
                ]
            },
            {
                unitNumber: 2,
                description: 'Get around in a city',
                backgroundColor: 'bg-[#ce82ff]',
                textColor: 'text-[#ce82ff]',
                borderColor: 'border-[#a568cc]',
                tiles: [
                    { type: 'fast-forward', description: 'Get around in a city' },
                    { type: 'dumbbell', description: 'Personalized practice' },
                    { type: 'book', description: 'One thing' },
                    { type: 'treasure' },
                    { type: 'star', description: 'Get around in a city' },
                    { type: 'book', description: 'A very big family' },
                    { type: 'star', description: 'Greet people' },
                    { type: 'book', description: 'The red jacket' },
                    { type: 'treasure' },
                    { type: 'dumbbell', description: 'Personalized practice' },
                    { type: 'trophy', description: 'Unit 2 review' }
                ]
            },
            {
                unitNumber: 3,
                description: 'Order food and drink',
                backgroundColor: 'bg-[#00cd9c]',
                textColor: 'text-[#00cd9c]',
                borderColor: 'border-[#00a47d]',
                tiles: [
                    { type: 'fast-forward', description: 'Order food and drink' },
                    { type: 'book', description: 'The passport' },
                    { type: 'star', description: 'Order food and drinks' },
                    { type: 'treasure' },
                    { type: 'book', description: 'The honeymoon' },
                    { type: 'star', description: 'Get around in a city' },
                    { type: 'treasure' },
                    { type: 'dumbbell', description: 'Personalized practice' },
                    { type: 'book', description: 'Doctor Eddy' },
                    { type: 'trophy', description: 'Unit 2 review' }
                ]
            }
        ]
        return {
            id: courseId,
            title: 'Learn English',
            description: 'Learn English with fun and games',
            cover: 'https://via.placeholder.com/150',
            units
        }
    }

    async getMetadataSteps(entryMdFilePath: string): Promise<{ metadata: CourseMetadata; steps: CourseStep[] }> {
        // 获取入口文件原始的 markdown 文本
        const { metadata, content } = await this.s3DataClient.getMdContent(entryMdFilePath)

        // 解析一级标题，将内容分成steps数组
        const steps = this.getStepsFromContent(content)
        return { metadata, steps }
    }

    /**
     * 从markdown文本中解析出1级标题，并将内容按1级标题分成steps数组，每个step包含name, description和content属性
     * 每个1级标题是一个step，其内容如下：
     * - 从标题行中解析设置step的name和descrition：# 标题名{可选的description}，其中标题名为step的name属性，可选的description为step的description属性；并且余要求标题不在markdown文件的代码段内部，即在代码段内部的文本要忽略
     * - 从内容行中设置step的content：标题行以及标题行下面的内容，直到下一个一级标题或文件末尾；如果标题行在标题名name的后面还有可选的属性，比如：{可选的description}，则将可选属性从内容中移除
     *
     * - 示例：
     *   # Step 1{This is the first step}
     *   content of step 1
     *   # Step 2{This is the second step}
     *   Content of step 2
     *   # Step 3{This is the third step}
     *   # Step 2
     *   Content of step 2
     *   ```
     *   # 代码内部的标题要忽略
     *   ```
     *
     *   # Step 3
     *   Content of step 3
     *   ```bash
     *   # 代码内部的标题要忽略
     *   ```
     *
     *   # Summary
     *   Conclusion of the course
     *
     * @param content markdown文本
     * @returns steps数组
     */
    getStepsFromContent(content: string): CourseStep[] {
        // 将内容按一级标题分割，但忽略代码块内的标题
        const sections: string[] = []
        let currentSection = ''
        let inCodeBlock = false

        const lines = content.split('\n')
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // 检测代码块开始和结束，支持 ``` 和 ```language 形式
            if (line.trim().match(/^```(\w*)$/)) {
                inCodeBlock = !inCodeBlock
            }

            // 如果遇到一级标题且不在代码块内，开始新的section
            if (line.startsWith('# ') && !inCodeBlock) {
                if (currentSection) {
                    sections.push(currentSection)
                }
                currentSection = line
            } else {
                currentSection += (currentSection ? '\n' : '') + line
            }
        }

        // 添加最后一个section
        if (currentSection) {
            sections.push(currentSection)
        }

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
                const signedUrl = await this.s3DataClient.getSignedUrl(s3FilePath)
                mdLine = line.replace(res, signedUrl)
            }
            mdLines.push(mdLine)
        }
        return mdLines.join('\n')
    }
}
