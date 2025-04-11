import { DynamoDBAdapter } from '@/persist/adapter-dynamodb'
import { dbAdapter } from '@/persist/db'
import { s3DataClient } from '@/persist/s3'
import S3DataClient from '@/persist/s3_data_client'
import { Course, CourseMetadata, CourseUnit, TileType, UnitStyle, CourseStep, Tile, STEPS_PER_TILE } from './types'
import { extractResourceFromMdLine, getAbsFilePath } from '@/lib/md_utils'
import path from 'path'

interface ViewStepsPageData {
    metadata: CourseMetadata
    steps: CourseStep[]
    currentStepIndex: number
    currentStepContent: string
}

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
    async getCourseList(slug: string): Promise<Course[] | null> {
        const courseDirPrefix = `docs/${slug}/course/`
        try {
            // 列出课程目录下的所有文件
            const files = await this.s3DataClient.listFiles(courseDirPrefix, 'index.md')
            if (!files || files.length === 0) return []
            // 获取所有课程子目录
            const courseDirs = new Set(
                files
                    .map((file) => {
                        const relativePath = file.substring(courseDirPrefix.length)
                        return relativePath.split('/')[0]
                    })
                    .filter((dir) => dir) // 过滤空字符串
            )

            const courses: Course[] = []

            // 遍历每个课程子目录
            for (const courseId of courseDirs) {
                const course = await this.getCourse(slug, courseId)
                if (course) courses.push(course)
            }

            return courses
        } catch (error) {
            console.error('Error getting course list:', error)
            return null
        }
    }

    async getCourse(slug: string, courseId: string): Promise<Course | null> {
        const courseDir = `docs/${slug}/course/${courseId}` // 构建 S3 文件路径
        const mdFilePath = `${courseDir}/index.md` // 构建 S3 文件路径

        // 读取index.md文件内容
        try {
            const { data, content } = await this.s3DataClient.getMdDataContent(mdFilePath)
            if (data) {
                const metadata = data as CourseMetadata
                if (metadata.cover) {
                    metadata.cover = await this.s3DataClient.getSignedUrl(path.join(courseDir, metadata.cover))
                }
                return {
                    id: courseDir,
                    metadata,
                    content,
                    units: null
                }
            } else {
                return null
            }
        } catch (error) {
            console.error(`Error processing course ${courseDir}:`, error)
            return null
        }
    }

    /**
     * 获取课程的详细信息，包括单元、步骤和瓦片的完整结构
     *
     * @param slug - 课程分类标识
     * @param courseId - 课程ID
     * @returns 返回包含完整课程信息的Course对象，如果获取失败则返回null
     *
     * 主要功能:
     * 1. 获取基础课程信息
     * 2. 解析课程内容，生成单元(units)数组
     * 3. 为每个单元生成:
     *    - 步骤(steps)：从单元内容中解析
     *    - 瓦片(tiles)：根据steps数量生成，每4个steps生成1个tile，并设置类型、名称、描述、steps属性；
     *    - 样式(style)：轮换使用预定义的样式
     *
     * 瓦片tile生成规则:
     * - 如果步骤数<=4，只生成1个fast-forward类型的tile
     * - 如果步骤数>4:
     *   - 第一个tile类型为fast-forward
     *   - 最后一个tile类型为trophy
     *   - 中间的tile轮换使用star/dumbbell/book类型
     */
    async getCourseUnitsAndTiles(slug: string, courseId: string): Promise<Course | null> {
        const course = await this.getCourse(slug, courseId)
        if (!course) {
            return null
        }

        const units = this.getUnitsFromContent(course.content)
        course.units = units
        const firstTileType = 'fast-forward'
        const lastTileType = 'trophy'
        const tileTypes: TileType[] = ['star', 'dumbbell', 'book']
        const unitStyles: UnitStyle[] = [
            { backgroundColor: 'bg-[#58cc02]', textColor: 'text-[#58cc02]', borderColor: 'border-[#46a302]' },
            { backgroundColor: 'bg-[#ce82ff]', textColor: 'text-[#ce82ff]', borderColor: 'border-[#a568cc]' },
            { backgroundColor: 'bg-[#00cd9c]', textColor: 'text-[#00cd9c]', borderColor: 'border-[#00a47d]' }
        ]
        let currentStyleIndex = 0
        for (const unit of course.units) {
            const steps = this.getStepsFromContent(unit.content)
            if (steps && steps.length > 0) {
                unit.steps = steps

                // 如果steps总数<=4,只生成一个fast-forward类型的tile
                if (steps.length <= STEPS_PER_TILE) {
                    unit.tiles = [
                        {
                            index: 0,
                            type: firstTileType,
                            name: unit.name,
                            description: unit.description,
                            steps: steps
                        }
                    ]
                } else {
                    // 每4个steps生成一个tile
                    let tileIndex = 0
                    const tiles: Tile[] = []
                    for (let i = 0; i < steps.length; i += STEPS_PER_TILE) {
                        const tileSteps = steps.slice(i, i + STEPS_PER_TILE)
                        tiles.push({
                            index: tileIndex,
                            type: 'star', // 默认类型，后面会修改
                            name: unit.name,
                            description: unit.description,
                            steps: tileSteps
                        })
                        tileIndex++
                    }

                    // 第一个tile设置为fast-forward
                    tiles[0].type = firstTileType

                    // 最后一个tile设置为trophy
                    tiles[tiles.length - 1].type = lastTileType

                    // 中间的tiles轮换其他类型
                    let currentTypeIndex = 0
                    for (let i = 1; i < tiles.length - 1; i++) {
                        tiles[i].type = tileTypes[currentTypeIndex]
                        currentTypeIndex = (currentTypeIndex + 1) % tileTypes.length
                    }

                    unit.tiles = tiles
                }
            } else {
                unit.tiles = []
                unit.steps = []
            }

            // 为unit设置轮换的style
            unit.style = unitStyles[currentStyleIndex]
            currentStyleIndex = (currentStyleIndex + 1) % unitStyles.length
        }
        return course
    }

    async getCourseUnitTileSteps(
        slug: string,
        courseId: string,
        unitIndex: number,
        tileIndex: number,
        stepIndex: number
    ): Promise<ViewStepsPageData | null> {
        const course = await this.getCourseUnitsAndTiles(slug, courseId)
        if (!course || !course.units) {
            return null
        }
        const unit = course.units[unitIndex]

        let currentStepIndex = 0
        if (stepIndex > 0) {
            currentStepIndex = stepIndex
        } else if (tileIndex > 0) {
            currentStepIndex = tileIndex * STEPS_PER_TILE
        }

        const currentStep = unit.steps?.[currentStepIndex]
        if (!unit || !currentStep) {
            return null
        }

        const courseDir = `docs/${slug}/course/${courseId}` // 构建 S3 目录路径
        const currentStepContent = await this.replaceResUrlsWithS3SignedUrls(courseDir, currentStep.content)

        const steps =
            tileIndex < 0 ? unit.steps : unit.steps?.slice(tileIndex * STEPS_PER_TILE, (tileIndex + 1) * STEPS_PER_TILE)
        if (!steps) return null

        // 在这里增加页面标题
        const content = `# ${currentStep.name}\n${currentStepContent}`
        return {
            metadata: course.metadata,
            steps,
            currentStepIndex,
            currentStepContent: content
        }
    }

    /**
     * 从markdown文本中解析出1级标题，并将内容按1级标题分成units数组，每个unit包含name, description和content属性，其内容如下：
     * - 从1级标题行中解析每个unit的name和descrition（可选）属性：# 单元名{可选的description}，其中"单元名"为unit的name属性，"可选的description"为unit的description属性；
     * - 从content解析并设置每个unit的content属性：将content设置为1级标题行以下第1个非空行开始直到下一个1级标题或文件末尾之间的内容。注意：不包括1级标题行本身；
     *
     * 注意：
     * - 1级标题标题名必须唯一，否则会导致解析出错；
     * - 要求1级标题不能出现在markdown文件的代码段内部，即：在代码段内部的文本中出现的标题要忽略，不能解析为标题
     * - markdown文件的代码块的开始部分有2种形式：```开头的，或者```language开头的，其中language可以是任何语言名称，比如：bash、javascript、python等，都要支持；
     *
     * 示例
     *   # Unit1{This is the first unit}
     *
     *   ## Step 1{This is the first step}
     *   content of step 1
     *   ## Step 2{This is the second step}
     *   Content of step 2
     *   ## Step 3{This is the third step}
     *   ## Step 2
     *   Content of step 2
     *   ```
     *   # 代码内部的标题要忽略
     *   ## 代码内部的标题要忽略
     *   ...code lines
     *   ```
     *
     *   ## Step 3
     *   Content of step 3
     *   ```bash
     *   ## 代码内部的标题要忽略
     *   ```
     *
     *   ## Summary
     *   Conclusion of the course
     *
     * @param content markdown文本
     * @returns CourseUnit数组
     **/
    getUnitsFromContent(content: string): CourseUnit[] {
        const units: CourseUnit[] = []
        const lines = content.split('\n')
        let inCodeBlock = false
        let currentUnit: CourseUnit | null = null
        let currentContent: string[] = []

        let unitIndex = 0
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // 检查是否进入或离开代码块
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock
                if (currentUnit) {
                    currentContent.push(line)
                }
                continue
            }

            // 如果在代码块内，直接添加到当前内容
            if (inCodeBlock) {
                if (currentUnit) {
                    currentContent.push(line)
                }
                continue
            }

            // 检查是否是1级标题
            if (line.trim().startsWith('# ') && !inCodeBlock) {
                // 如果已有当前单元，保存它
                if (currentUnit) {
                    currentUnit.content = currentContent.join('\n').trim()
                    units.push(currentUnit)
                    unitIndex++
                }

                // 解析新的单元标题
                const titleMatch = line.match(/^# ([^{]+)(?:{(.+)})?/)
                if (titleMatch) {
                    currentUnit = {
                        index: unitIndex,
                        name: titleMatch[1].trim(),
                        description: titleMatch[2] ? titleMatch[2].trim() : '',
                        content: '',
                        steps: null,
                        tiles: null,
                        style: null
                    }
                    currentContent = []
                }
            } else if (currentUnit) {
                currentContent.push(line)
            }
        }

        // 保存最后一个单元
        if (currentUnit) {
            currentUnit.content = currentContent.join('\n').trim()
            units.push(currentUnit)
        }

        return units
    }

    /**
     * 从markdown文本中解析出2级标题，并将内容按2级标题分成steps数组，每个2级标题作为一个step，每个step包含name, description和content属性，其内容如下：
     * - 从2级标题行中解析每个step的name和descrition属性：## 标题名{可选的description}，其中标题名为step的name属性，可选的description为step的description属性；
     * - 从content解析并设置每个step的content属性：将content设置为从2级标题行以下第1个非空行开始直到下一个2级标题或文件末尾之间的内容。注意：不包括2级标题行本身；
     *
     * 注意：
     * - 2级标题的标题名必须唯一，否则会导致解析出错；
     * - 要求2级标题不能出现在markdown文件的代码段内部，即：在代码段内部的文本中出现的标题要忽略，不能解析为标题
     * - markdown文件的代码块的开始部分有2种形式：```开头的，或者```language开头的，其中language可以是任何语言名称，比如：bash、javascript、python等，都要支持；
     *
     * 示例：
     *   ## Step 1{This is the first step}
     *   content of step 1
     *   ## Step 2{This is the second step}
     *   Content of step 2
     *   ## Step 3{This is the third step}
     *   ## Step 2
     *   Content of step 2
     *   ```
     *   ## 代码内部的标题要忽略
     *   ```
     *
     *   ## Step 3
     *   Content of step 3
     *   ```bash
     *   ## 代码内部的标题要忽略
     *   ```
     *
     *   ## Summary
     *   Conclusion of the course
     *
     * @param content markdown文本
     * @returns CourseTile数组
     */
    getStepsFromContent(content: string): CourseStep[] {
        const steps: CourseStep[] = []
        const lines = content.split('\n')
        let inCodeBlock = false
        let currentStep: CourseStep | null = null
        let currentContent: string[] = []

        let stepIndex = 0
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // 检查是否进入或离开代码块
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock
                if (currentStep) {
                    currentContent.push(line)
                }
                continue
            }

            // 如果在代码块内，直接添加到当前内容
            if (inCodeBlock) {
                if (currentStep) {
                    currentContent.push(line)
                }
                continue
            }

            // 检查是否是2级标题
            if (line.trim().startsWith('## ') && !inCodeBlock) {
                // 如果已有当前tile，保存它
                if (currentStep) {
                    currentStep.content = currentContent.join('\n').trim()
                    steps.push(currentStep)
                    stepIndex++
                }

                // 解析新的tile标题
                const titleMatch = line.match(/^## ([^{]+)(?:{(.+)})?/)
                if (titleMatch) {
                    currentStep = {
                        index: stepIndex,
                        name: titleMatch[1].trim(),
                        description: titleMatch[2] ? titleMatch[2].trim() : '',
                        content: ''
                    }
                    currentContent = []
                }
            } else if (currentStep) {
                currentContent.push(line)
            }
        }

        // 保存最后一个tile
        if (currentStep) {
            currentStep.content = currentContent.join('\n').trim()
            steps.push(currentStep)
        }

        return steps
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
