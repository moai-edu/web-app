export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { s3DataClient } from '@/persist/s3'
import { Box, Flex } from '@radix-ui/themes'
import TaskSteps from './task_steps'
import path from 'path'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

import { compileMdx } from 'nextra/compile'
import { evaluate } from 'nextra/evaluate'
import MobileDrawerTaskSteps from './mobile_drawer_task_steps'

// 直接使用 Nextra 的组件，排除 wrapper
const { wrapper, ...components } = getMDXComponents()

type PageProps = Readonly<{
    params: Promise<{ slug: string; path: string[] }>
    searchParams: Promise<{ step?: string }>
}>

export default async function Page({ params, searchParams }: PageProps) {
    const { slug, path: urlPath } = await params
    const { step } = await searchParams
    const filePath = `docs/${slug}/course/${urlPath.join('/')}/index.md` // 构建 S3 文件路径
    const entryFileDir = path.dirname(filePath)

    const current = step ? parseInt(step) : 0 // 获取当前步骤

    let isAuthorized = false
    try {
        const { metadata, steps } = await s3DataClient.getMetadataSteps(filePath)
        if (slug === 'public' || (metadata.access && metadata.access === 'public')) {
            isAuthorized = true
        } else {
            const session = await auth()
            isAuthorized = session?.user?.slug === slug
        }

        if (isAuthorized) {
            const stepContent = steps[current].content
            const data = await s3DataClient.replaceResUrlsWithS3SignedUrls(entryFileDir, stepContent)

            const rawJs = await compileMdx(data, { filePath })
            const { default: MDXContent } = evaluate(rawJs, components)

            return (
                <Flex direction="column" gap="4">
                    {/* 移动端显示的按钮和抽屉 */}
                    <div className="md:hidden">
                        <MobileDrawerTaskSteps steps={steps} status="process" current={current} />
                    </div>
                    <Flex gap="3">
                        {/* 桌面端显示的侧边栏 - 在移动端隐藏 */}
                        <div style={{ width: '225px', minWidth: '225px' }} className="hidden md:block">
                            <TaskSteps current={current} status="process" steps={steps} />
                        </div>

                        <Box px="4">
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
                Document or step is not found. filePath: {filePath}, step: {current}
            </h1>
        )
    }
}
