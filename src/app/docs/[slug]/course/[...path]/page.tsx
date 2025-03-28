export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { s3DataClient } from '@/persist/s3'
import { Box, Flex } from '@radix-ui/themes'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'
import TaskSteps from './task_steps'
import path from 'path'

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ slug: string; path: string[] }>
    searchParams: Promise<{ step?: string }>
}) {
    const { slug, path: urlPath } = await params
    const { step } = await searchParams
    const filePath = `docs/${slug}/course/${urlPath.join('/')}/index.md` // 构建 S3 文件路径
    const entryFileDir = path.dirname(filePath)

    const current = step ? parseInt(step) : 0 // 获取当前步骤
    try {
        let isAuthorized = false
        const { metadata, steps } = await s3DataClient.getMetadataSteps(
            filePath
        )
        if (
            slug === 'public' ||
            (metadata.access && metadata.access === 'public')
        ) {
            isAuthorized = true
        } else {
            const session = await auth()
            isAuthorized = session?.user?.slug === slug
        }

        if (isAuthorized) {
            const stepContent = steps[current].content
            const s3StepContent =
                await s3DataClient.replaceResUrlsWithS3SignedUrls(
                    entryFileDir,
                    stepContent
                )

            return (
                <Flex gap="3">
                    <Box width="250px">
                        <TaskSteps
                            current={current}
                            status="process"
                            steps={steps}
                        />
                    </Box>
                    <Box px="4">
                        <Suspense fallback={<>Loading...</>}>
                            <MDXRemote source={s3StepContent} />
                        </Suspense>
                    </Box>
                </Flex>
            )
        } else return <h1>Document is not authorized for access</h1>
    } catch (error) {
        console.error(error)
        return (
            <h1>
                Document or step is not found. filePath: {filePath}, step:{' '}
                {current}
            </h1>
        )
    }
}
