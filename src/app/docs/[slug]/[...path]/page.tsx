export const dynamic = 'force-dynamic'
import { s3DataClient } from '@/persist/s3'
import {
    Box,
    Card,
    Flex,
    Grid,
    Heading,
    IconButton,
    Slider,
    Text
} from '@radix-ui/themes'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'
import { Label } from '@radix-ui/react-label'

function ThemesVolumeControlExample() {
    return (
        <Flex
            justify="center"
            style={{
                backgroundColor: 'var(--gray-2)',
                borderRadius: 'var(--radius-1)',
                minWidth: 350
            }}
            p={{ initial: '5', sm: '6' }}
        >
            <Card size="3" style={{ width: '100%' }} variant="classic">
                <Flex direction="column">
                    <Flex align="center" justify="between" mb="6">
                        <Heading as="h3" size="4" trim="both">
                            课程名称
                        </Heading>

                        <Flex gap="4">
                            <Text size="2" color="gray">
                                预计用时：10分钟
                            </Text>
                        </Flex>
                    </Flex>

                    <Flex gap="2" align="center" height="4" mt="2" mb="5">
                        <Slider size="3" defaultValue={[75]} />
                    </Flex>

                    <Grid
                        columns={{ initial: '2', xs: '4' }}
                        pt="2"
                        pb="1"
                        gapY="5"
                    >
                        <Flex direction="column" gap="2" align="center" asChild>
                            <Label>
                                <IconButton variant="soft" color="gray">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 30 30"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                    >
                                        <path d="M 21 4 C 20.448 4 20 4.448 20 5 L 20 25 C 20 25.552 20.448 26 21 26 L 25 26 C 25.552 26 26 25.552 26 25 L 26 5 C 26 4.448 25.552 4 25 4 L 21 4 z M 13 10 C 12.448 10 12 10.448 12 11 L 12 25 C 12 25.552 12.448 26 13 26 L 17 26 C 17.552 26 18 25.552 18 25 L 18 11 C 18 10.448 17.552 10 17 10 L 13 10 z M 5 16 C 4.448 16 4 16.448 4 17 L 4 25 C 4 25.552 4.448 26 5 26 L 9 26 C 9.552 26 10 25.552 10 25 L 10 17 C 10 16.448 9.552 16 9 16 L 5 16 z" />
                                    </svg>
                                </IconButton>
                                <Flex direction="column">
                                    <Text align="center" weight="bold" size="2">
                                        准备环境
                                    </Text>
                                    <Text align="center" color="gray" size="1">
                                        1
                                    </Text>
                                </Flex>
                            </Label>
                        </Flex>

                        <Flex direction="column" gap="2" align="center" asChild>
                            <Label>
                                <IconButton variant="solid">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 30 30"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                    >
                                        <path d="M 22 4 A 1.0001 1.0001 0 1 0 22 6 L 28 6 A 1.0001 1.0001 0 1 0 28 4 L 22 4 z M 2 8 A 1.0001 1.0001 0 1 0 2 10 L 8 10 A 1.0001 1.0001 0 1 0 8 8 L 2 8 z M 22 8 A 1.0001 1.0001 0 1 0 22 10 L 28 10 A 1.0001 1.0001 0 1 0 28 8 L 22 8 z M 2 12 A 1.0001 1.0001 0 1 0 2 14 L 8 14 A 1.0001 1.0001 0 1 0 8 12 L 2 12 z M 22 12 A 1.0001 1.0001 0 1 0 22 14 L 28 14 A 1.0001 1.0001 0 1 0 28 12 L 22 12 z M 2 16 A 1.0001 1.0001 0 1 0 2 18 L 8 18 A 1.0001 1.0001 0 1 0 8 16 L 2 16 z M 12 16 A 1.0001 1.0001 0 1 0 12 18 L 18 18 A 1.0001 1.0001 0 1 0 18 16 L 12 16 z M 22 16 A 1.0001 1.0001 0 1 0 22 18 L 28 18 A 1.0001 1.0001 0 1 0 28 16 L 22 16 z M 2 20 A 1.0001 1.0001 0 1 0 2 22 L 8 22 A 1.0001 1.0001 0 1 0 8 20 L 2 20 z M 12 20 A 1.0001 1.0001 0 1 0 12 22 L 18 22 A 1.0001 1.0001 0 1 0 18 20 L 12 20 z M 22 20 A 1.0001 1.0001 0 1 0 22 22 L 28 22 A 1.0001 1.0001 0 1 0 28 20 L 22 20 z M 2 24 A 1.0001 1.0001 0 1 0 2 26 L 8 26 A 1.0001 1.0001 0 1 0 8 24 L 2 24 z M 12 24 A 1.0001 1.0001 0 1 0 12 26 L 18 26 A 1.0001 1.0001 0 1 0 18 24 L 12 24 z M 22 24 A 1.0001 1.0001 0 1 0 22 26 L 28 26 A 1.0001 1.0001 0 1 0 28 24 L 22 24 z" />
                                    </svg>
                                </IconButton>
                                <Flex direction="column">
                                    <Text align="center" weight="bold" size="2">
                                        开始编码
                                    </Text>
                                    <Text align="center" color="gray" size="1">
                                        2
                                    </Text>
                                </Flex>
                            </Label>
                        </Flex>

                        <Flex direction="column" gap="2" align="center" asChild>
                            <Label>
                                <IconButton variant="soft" color="gray">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 30 30"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                    >
                                        <path d="M 15 3 C 14.501862 3 14.004329 3.1237904 13.554688 3.3710938 L 4.7773438 8.1992188 C 4.2990638 8.4622726 4 8.9690345 4 9.5136719 L 4 10.128906 L 4 20.048828 C 4 20.573313 4.2799803 21.064852 4.7265625 21.333984 A 1.0001 1.0001 0 0 0 4.7285156 21.335938 L 13.457031 26.572266 C 14.405619 27.141718 15.594381 27.141718 16.542969 26.572266 L 25.269531 21.337891 L 25.271484 21.335938 C 25.723679 21.065216 26 20.572371 26 20.048828 L 26 9.5136719 C 26 8.9690345 25.700936 8.4622727 25.222656 8.1992188 L 16.445312 3.3710938 C 15.99567 3.1237903 15.498138 3 15 3 z M 15 5 C 15.166032 5 15.332064 5.0423034 15.482422 5.125 L 23.166016 9.3496094 L 19.755859 11.179688 L 20.701172 12.941406 L 24 11.171875 L 24 19.765625 L 16 24.566406 L 16 21 L 14 21 L 14 24.566406 L 6 19.765625 L 6 11.171875 L 9.2988281 12.941406 L 10.244141 11.179688 L 6.8339844 9.3496094 L 14.517578 5.125 C 14.667936 5.0423034 14.833968 5 15 5 z M 15 11 A 4 4 0 0 0 15 19 A 4 4 0 0 0 15 11 z" />
                                    </svg>
                                </IconButton>
                                <Flex direction="column">
                                    <Text align="center" weight="bold" size="2">
                                        调试测试
                                    </Text>
                                    <Text align="center" color="gray" size="1">
                                        3
                                    </Text>
                                </Flex>
                            </Label>
                        </Flex>

                        <Flex direction="column" gap="2" align="center" asChild>
                            <Label>
                                <IconButton variant="soft" color="gray">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 30 30"
                                        width="16"
                                        height="16"
                                        fill="currentcolor"
                                    >
                                        <path d="M 8.984375 3.9863281 A 1.0001 1.0001 0 0 0 8 5 L 8 16 A 1.0001 1.0001 0 1 0 10 16 L 10 5 A 1.0001 1.0001 0 0 0 8.984375 3.9863281 z M 4.984375 6.9863281 A 1.0001 1.0001 0 0 0 4 8 L 4 16 A 1.0001 1.0001 0 1 0 6 16 L 6 8 A 1.0001 1.0001 0 0 0 4.984375 6.9863281 z M 12.984375 9.9863281 A 1.0001 1.0001 0 0 0 12 11 L 12 16 A 1.0001 1.0001 0 1 0 14 16 L 14 11 A 1.0001 1.0001 0 0 0 12.984375 9.9863281 z M 0.984375 11.986328 A 1.0001 1.0001 0 0 0 0 13 L 0 16 A 1.0001 1.0001 0 1 0 2 16 L 2 13 A 1.0001 1.0001 0 0 0 0.984375 11.986328 z M 16.984375 14.986328 A 1.0001 1.0001 0 0 0 16 16 L 16 21 A 1.0001 1.0001 0 1 0 18 21 L 18 16 A 1.0001 1.0001 0 0 0 16.984375 14.986328 z M 20.984375 14.986328 A 1.0001 1.0001 0 0 0 20 16 L 20 26 A 1.0001 1.0001 0 1 0 22 26 L 22 16 A 1.0001 1.0001 0 0 0 20.984375 14.986328 z M 24.984375 14.986328 A 1.0001 1.0001 0 0 0 24 16 L 24 23 A 1.0001 1.0001 0 1 0 26 23 L 26 16 A 1.0001 1.0001 0 0 0 24.984375 14.986328 z M 28.984375 14.986328 A 1.0001 1.0001 0 0 0 28 16 L 28 19 A 1.0001 1.0001 0 1 0 30 19 L 30 16 A 1.0001 1.0001 0 0 0 28.984375 14.986328 z" />
                                    </svg>
                                </IconButton>
                                <Flex direction="column">
                                    <Text align="center" weight="bold" size="2">
                                        上线演示
                                    </Text>
                                    <Text align="center" color="gray" size="1">
                                        4
                                    </Text>
                                </Flex>
                            </Label>
                        </Flex>
                    </Grid>
                </Flex>
            </Card>
        </Flex>
    )
}

export default async function Page({
    params
}: {
    params: Promise<{ slug: string; path: string[] }>
}) {
    const { slug, path } = await params
    const filePath = `${slug}/${path.join('/')}.md` // 构建 S3 文件路径

    const source = await s3DataClient.getMarkdownTextWithS3SignedUrls(filePath)

    return (
        <Flex gap="3" direction="column">
            <Box>
                <ThemesVolumeControlExample />
            </Box>
            <Box py="4">
                <Suspense fallback={<>Loading...</>}>
                    <MDXRemote source={source} />
                </Suspense>
            </Box>
        </Flex>
    )
}
