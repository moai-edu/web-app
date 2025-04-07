import { s3Client, s3DataClient } from '@/persist/s3'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseDomain } from './course_domain'
import { identity } from '@tsparticles/engine'

describe('replaceResUrlsWithS3SignedUrls', () => {
    beforeEach(() => {
        vi.spyOn(s3DataClient, 'getMdContent').mockResolvedValue({
            metadata: {},
            content: `# Sample Markdown
![Image](./image.png)
[PDF File](../docs/sample.pdf)
# Slide {data-background-image=/assets/bg.jpg data-background-size=contain}`
        })
        vi.spyOn(s3DataClient, 'getSignedUrl').mockImplementation(
            async (key: string) => `https://signed-url.com/${key}`
        )
    })

    it('should replace resource paths with signed URLs', async () => {
        const mdContent = `# Sample Markdown
![Image](./image.png)
[PDF File](../foobar/sample.pdf)
# Slide {data-background-image=/assets/bg.jpg data-background-size=contain}
`
        const courseDomain = new CourseDomain()
        const result = await courseDomain.replaceResUrlsWithS3SignedUrls('docs', mdContent)

        expect(result).toContain('https://signed-url.com/docs/image.png')
        expect(result).toContain('https://signed-url.com/foobar/sample.pdf')
        expect(result).toContain('https://signed-url.com/assets/bg.jpg')
    })
})

describe('getCourseList', () => {
    describe('getCourseList succeeds', () => {
        // 准备测试数据
        const mockMetadata = {
            title: 'Sample Title',
            description: 'Sample Description',
            cover: 'cover.jpg'
        }
        const mockContent = `# Sample Markdown
test content
`
        const mockKeys = ['docs/test/course/path1/index.md', 'docs/test/course/path2/index.md']

        const courseDomain = new CourseDomain()
        beforeEach(() => {
            vi.spyOn(courseDomain.s3DataClient, 'listFiles').mockResolvedValue(mockKeys)
            vi.spyOn(courseDomain.s3DataClient, 'getMdContent').mockResolvedValue({
                metadata: mockMetadata,
                content: mockContent
            })
            vi.spyOn(s3DataClient, 'getSignedUrl').mockImplementation(
                async (key: string) => `https://signed-url.com/${key}`
            )
        })

        afterEach(async () => {
            // 清理所有模拟
            vi.clearAllMocks()
        })

        it('获得测试课程列表数据', async () => {
            // 执行测试
            const courseList = await courseDomain.getCourseList('test')
            expect(courseList).toEqual([
                {
                    id: 'path1',
                    ...mockMetadata,
                    cover: `https://signed-url.com/docs/test/course/path1/${mockMetadata.cover}`
                },
                {
                    id: 'path2',
                    ...mockMetadata,
                    cover: `https://signed-url.com/docs/test/course/path2/${mockMetadata.cover}`
                }
            ])
        })
    })
})
