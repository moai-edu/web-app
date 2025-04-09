export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { Box, Flex } from '@radix-ui/themes'
import TaskSteps from './task_steps'
import path from 'path'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

import { compileMdx } from 'nextra/compile'
import { evaluate } from 'nextra/evaluate'
import MobileDrawerTaskSteps from './mobile_drawer_task_steps'
import { CourseDomain } from '@/domain/course_domain'

// 直接使用 Nextra 的组件，排除 wrapper
const { wrapper, ...components } = getMDXComponents()

type PageProps = Readonly<{
    params: Promise<{ slug: string; courseId: string; unitIndex: string }>
    searchParams: Promise<{ stepIndex?: string }>
}>

export default async function Page({ params, searchParams }: PageProps) {
    const { slug, courseId, unitIndex } = await params
    const { stepIndex } = await searchParams
    const currentStep = stepIndex ? parseInt(stepIndex) : 0 // 获取当前步骤
    console.log('params:', slug, courseId, unitIndex, stepIndex, currentStep)

    const filePath = `docs/${slug}/course/${courseId}/index.md` // 构建 S3 文件路径

    const courseDomain = new CourseDomain()
    let isAuthorized = false
    try {
        const result = await courseDomain.getCourseUnitStep(slug, courseId, parseInt(unitIndex), currentStep)
        if (!result) {
            throw new Error('Course unit step not found')
        }

        const { metadata, unit, content } = result
        if (slug === 'public' || (metadata.access && metadata.access === 'public')) {
            isAuthorized = true
        } else {
            const session = await auth()
            isAuthorized = session?.user?.slug === slug
        }

        if (isAuthorized) {
            const rawJs = await compileMdx(content, { filePath })
            const { default: MDXContent } = evaluate(rawJs, components)
            return (
                <Flex direction="column" gap="4">
                    {/* 移动端显示的按钮和抽屉 */}
                    <Box display={{ initial: 'block', md: 'none' }}>
                        <MobileDrawerTaskSteps steps={unit.steps || []} status="process" current={currentStep} />
                    </Box>
                    <Flex gap="3">
                        {/* 桌面端显示的侧边栏 - 在移动端隐藏 */}
                        <Box width="225px" minWidth="225px" pl="4" pt="4" display={{ initial: 'none', md: 'block' }}>
                            <TaskSteps current={currentStep} status="process" steps={unit.steps || []} />
                        </Box>
                        <Box px="4" maxWidth="100%">
                            <MDXContent />
                        </Box>
                    </Flex>
                </Flex>
            )
        } else return <h1>Document is not authorized for access</h1>
    } catch (error) {
        console.error(error)
        return (
            <h1>
                Document or step is not found. filePath: {filePath}, step: {currentStep}
            </h1>
        )
    }
}
