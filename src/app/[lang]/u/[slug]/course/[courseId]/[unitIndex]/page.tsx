export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { Box, Button, Flex } from '@radix-ui/themes'
import TaskSteps from '@/components/task_step/task_steps'

import { compileMdx } from 'nextra/compile'
import { evaluate } from 'nextra/evaluate'
import MobileDrawerTaskSteps from '@/components/task_step/mobile_drawer_task_steps'
import { CourseDomain } from '@/domain/course_domain'
import { ExitIcon } from '@radix-ui/react-icons'
import { useMDXComponents } from '@/mdx-components'

type PageProps = Readonly<{
    params: Promise<{ slug: string; courseId: string; unitIndex: string }>
    searchParams: Promise<{ tileIndex?: string; stepIndex?: string }>
}>

export default async function Page({ params, searchParams }: PageProps) {
    const { slug, courseId, unitIndex } = await params
    const { tileIndex, stepIndex } = await searchParams
    console.log('params:', slug, courseId, unitIndex, tileIndex, stepIndex)

    const courseDomain = new CourseDomain()
    let isAuthorized = false
    try {
        const _unitIndex = parseInt(unitIndex)
        const _tileIndex = tileIndex ? parseInt(tileIndex) : -1
        const _stepIndex = stepIndex ? parseInt(stepIndex) : -1
        const result = await courseDomain.getCourseUnitTileSteps(slug, courseId, _unitIndex, _tileIndex, _stepIndex)
        if (!result) {
            throw new Error('Course unit step not found')
        }

        const { metadata, steps, currentStepIndex, currentStepContent } = result
        if (slug === 'public' || (metadata.access && metadata.access === 'public')) {
            isAuthorized = true
        } else {
            const session = await auth()
            isAuthorized = session?.user?.slug === slug
        }

        if (isAuthorized) {
            const rawJs = await compileMdx(currentStepContent, { filePath: 's3://foobar' })

            // 直接使用 Nextra 的组件，排除 wrapper以后，余下成员放入components中
            const { wrapper, ...components } = useMDXComponents()
            const { default: MDXContent } = evaluate(rawJs, components)
            return (
                <Flex direction="column" gap="4">
                    {/* 移动端显示的按钮和抽屉 */}
                    <Box display={{ initial: 'block', md: 'none' }}>
                        <MobileDrawerTaskSteps steps={steps} tileIndex={_tileIndex} stepIndex={currentStepIndex} />
                    </Box>
                    <Flex gap="3">
                        {/* 桌面端显示的侧边栏 - 在移动端隐藏 */}
                        <Box width="225px" minWidth="225px" pl="4" pt="4" display={{ initial: 'none', md: 'block' }}>
                            <TaskSteps steps={steps} tileIndex={_tileIndex} stepIndex={currentStepIndex} />
                        </Box>
                        <Flex direction="column" gap="4" width="100%">
                            {/* 桌面端显示的退出按钮 - 在移动端隐藏 */}
                            <Flex justify="end" width="100%" pt="2" pr="4" display={{ initial: 'none', md: 'flex' }}>
                                <form action="..">
                                    <Button type="submit" color="crimson">
                                        <ExitIcon /> 退出
                                    </Button>
                                </form>
                            </Flex>
                            <MDXContent />
                        </Flex>
                    </Flex>
                </Flex>
            )
        } else return <h1>Document is not authorized for access</h1>
    } catch (error) {
        console.error(error)
        return <h1>Error: Document or step is not found.</h1>
    }
}
