export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { s3DataClient } from '@/persist/s3'
import { Box, Flex } from '@radix-ui/themes'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'
import TaskSteps from './task_steps'

const description = null
const steps = [
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    { title: 'Finished', description },
    {
        title: 'In Progress',
        description
    },
    {
        title: 'Waiting',
        description
    }
]
export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ slug: string; path: string[] }>
    searchParams: Promise<{ step?: string }>
}) {
    const { slug, path } = await params
    const { step } = await searchParams
    const filePath = `docs/${slug}/course/${path.join('/')}/index.md` // 构建 S3 文件路径
    console.log('############')
    console.log(path)
    console.log(step)
    console.log('############')
    const current = step ? parseInt(step) : 0 // 获取当前步骤
    try {
        let isAuthorized = false
        const { metadata, steps } =
            await s3DataClient.getMarkdownTextWithS3SignedUrls(filePath)
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
                            <MDXRemote source={steps[current].content} />
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
