export const dynamic = 'force-dynamic'

import { UnitSection } from '@/components/course_unit/unit_section'
import { ScrollHandler } from '@/components/course_unit/scroll_handler'
import { CourseDomain } from '@/domain/course_domain'

type PageProps = Readonly<{
    params: Promise<{ slug: string; courseId: string }>
}>

export default async function Page({ params }: PageProps) {
    const { slug, courseId } = await params
    const courseDomain = new CourseDomain()
    const course = await courseDomain.getCourseUnitsAndTiles(slug, courseId)
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
                    <UnitSection unit={unit} units={units} id={courseId} key={index} />
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
