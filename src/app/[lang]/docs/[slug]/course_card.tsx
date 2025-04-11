import { Course } from '@/domain/types'
import { Box, Card, Inset, Text, Strong, Flex, Link } from '@radix-ui/themes'

type PageProps = Readonly<{
    slug: string
    course: Course
}>

export default async function CourseCard({ slug, course }: PageProps) {
    return (
        <Box maxWidth="250px">
            <Link href={`${slug}/course/${course.id}`} underline="none">
                <Card size="4">
                    <Inset clip="padding-box" side="top" pb="current">
                        <img
                            src={course.coverUrl || '/img/default-cover.avif'}
                            alt={course.metadata.title}
                            style={{
                                display: 'block',
                                objectFit: 'cover',
                                width: '100%',
                                height: 140,
                                backgroundColor: 'var(--gray-5)'
                            }}
                        />
                    </Inset>
                    <Text as="p" size="3">
                        <Strong>{course.metadata.title || ''}</Strong>
                    </Text>
                    <Text weight="regular">{course.metadata.description}</Text>
                </Card>
            </Link>
        </Box>
    )
}
