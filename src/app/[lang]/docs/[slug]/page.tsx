export const dynamic = 'force-dynamic'

import { Flex, Heading } from '@radix-ui/themes'
import CourseCard from './course_card'
import { CourseDomain } from '@/domain/course_domain'

type PageProps = Readonly<{
    params: Promise<{ slug: string }>
}>

export default async function Page({ params }: PageProps) {
    const { slug } = await params
    const courseDomain = new CourseDomain()

    const courseList = await courseDomain.getCourseList(slug)
    return (
        <Flex direction="column" gap="5" p="5">
            <Heading as="h1">{slug}</Heading>
            <Heading as="h2">课程:</Heading>
            <Flex gap="3" wrap="wrap">
                {courseList.map((course, i) => (
                    <CourseCard key={i} slug={slug} course={course} />
                ))}
            </Flex>
        </Flex>
    )
}
