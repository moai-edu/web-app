export const dynamic = 'force-dynamic'

import { Flex } from '@radix-ui/themes'
import CourseCard from './course_card'
import { CourseDomain } from '@/domain/course_domain'
import { auth } from '@/auth'
import { I18nLangKeys } from '@/i18n'

type PageProps = Readonly<{
    params: Promise<{ slug: string; lang: I18nLangKeys }>
}>

export default async function Page({ params }: PageProps) {
    const { lang } = await params
    const session = await auth()
    const slug = session!.user!.slug!
    const courseDomain = new CourseDomain()
    const courseList = await courseDomain.getCourseList(slug)
    if (!courseList) {
        return <div>No courses found</div>
    }
    return (
        <Flex direction="column" gap="5" p="5">
            <Flex gap="3" wrap="wrap">
                {courseList.map((course, i) => (
                    <CourseCard key={i} urlPrefix={`/${lang}/u/${slug}`} course={course} />
                ))}
            </Flex>
        </Flex>
    )
}
