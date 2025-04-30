export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { I18nLangKeys } from '@/i18n'
import { UnitSection } from '@/components/course_unit/unit_section'
import { ScrollHandler } from '@/components/course_unit/scroll_handler'
import { CourseDomain } from '@/domain/course_domain'

type Props = Readonly<{
    params: Promise<{ lang: I18nLangKeys; joinedClassId: string }>
}>

export default async function Page({ params }: Props) {
    const { lang, joinedClassId } = await params

    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return <div>Not authenticated</div>
    }

    const userJoinClassDomain = new UserJoinClassDomain()
    const model = await userJoinClassDomain.getById(joinedClassId)
    if (!model || model.user!.id !== session.user.id) {
        return <div>Not authenticated</div>
    }

    const courseDomain = new CourseDomain()
    const course = await courseDomain.getCourseUnitsAndTiles(model.class!.user!.slug!, model.class!.courseId)
    if (!course) {
        return <div>Course not found</div>
    }

    const units = course.units
    if (!units) {
        return <div>Error: Course has no units</div>
    }
    return (
        <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 lg:gap-12">
            <div className="flex max-w-2xl grow flex-col">
                {units.map((unit, index) => (
                    <UnitSection id={joinedClassId} units={units} unit={unit} key={index} />
                ))}
                <div className="sticky bottom-28 left-0 right-0 flex items-end justify-between">
                    {/* <Link
                        href="/lesson?practice"
                        className="absolute left-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:left-0"
                    >
                        <span className="sr-only">Practice exercise</span>
                        <PracticeExerciseSvg className="h-8 w-8" />
                    </Link> */}
                    <ScrollHandler />
                </div>
            </div>
        </div>
    )
}
