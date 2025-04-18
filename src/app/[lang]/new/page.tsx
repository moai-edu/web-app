export const dynamic = 'force-dynamic'

import { Container } from '@radix-ui/themes'
import CreateClassForm from './create_class_form'
import { CourseDomain } from '@/domain/course_domain'
import { auth } from '@/auth'

export default async function Page() {
    const session = await auth()
    const slug = session!.user!.slug!
    const courseDomain = new CourseDomain()
    const courseList = await courseDomain.getCourseList(slug)
    if (!courseList || courseList.length === 0) {
        return <div>No courses found</div>
    }

    return (
        <Container size="2" p="4">
            <CreateClassForm courseList={courseList} />
        </Container>
    )
}
