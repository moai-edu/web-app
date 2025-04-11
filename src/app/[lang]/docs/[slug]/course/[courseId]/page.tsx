export const dynamic = 'force-dynamic'

import { PracticeExerciseSvg } from '@/components/Svgs'
import Link from 'next/link'
import { UnitSection } from './unit_section'
import { ScrollHandler } from './scroll_handler'
import { CourseDomain } from '@/domain/course_domain'

type PageProps = Readonly<{
    params: Promise<{ slug: string; courseId: string }>
}>

export default async function Page({ params }: PageProps) {
    const { slug, courseId } = await params
    console.log(`Slug: ${slug}, Course: ${courseId}`)
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
        <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
            <div className="flex max-w-2xl grow flex-col">
                {units.map((unit, index) => (
                    <UnitSection units={units} unit={unit} index={index} key={index} />
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
