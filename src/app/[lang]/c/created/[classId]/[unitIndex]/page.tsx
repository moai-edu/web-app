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
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { I18nLangKeys } from '@/i18n'
import { ClassDomain } from '@/domain/class_domain'

type PageProps = Readonly<{
    params: Promise<{
        lang: I18nLangKeys
        classId: string
        unitIndex: string
    }>
    searchParams: Promise<{ tileIndex?: string; stepIndex?: string }>
}>

export default async function Page({ params, searchParams }: PageProps) {
    const { lang, classId, unitIndex } = await params
    const { tileIndex, stepIndex } = await searchParams
    console.log('params:', classId, unitIndex, tileIndex, stepIndex)

    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return <div>Not authenticated</div>
    }

    const courseDomain = new CourseDomain()
    try {
        // 从joinedClassId获取slug和courseId
        const domain = new ClassDomain()
        const klass = await domain.getById(classId)
        if (!klass || klass.userId !== session.user.id) {
            return <h1>Document is not authorized for access</h1>
        }

        const _unitIndex = parseInt(unitIndex)
        const _tileIndex = tileIndex ? parseInt(tileIndex) : -1
        const _stepIndex = stepIndex ? parseInt(stepIndex) : -1
        const result = await courseDomain.getCourseUnitTileSteps(
            session.user!.slug!,
            klass.courseId,
            _unitIndex,
            _tileIndex,
            _stepIndex
        )
        if (!result) {
            throw new Error('Course unit step not found')
        }

        const { metadata, steps, currentStepIndex, currentStepContent } = result

        const rawJs = await compileMdx(currentStepContent, { filePath: 's3://foobar' })
        // 直接使用 Nextra 的组件，排除 wrapper以后，余下成员放入components中
        const { wrapper, ...components } = useMDXComponents(lang, klass)
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
    } catch (error) {
        console.error(error)
        return <h1>Error: Document or step is not found.</h1>
    }
}
