import { CourseStep, STEPS_PER_TILE } from '@/domain/types'
import { Link } from '@radix-ui/themes'
import { Steps } from 'antd'

interface PageProps {
    tileIndex: number
    stepIndex: number
    steps: CourseStep[]
}
export default function TaskSteps({ tileIndex, stepIndex, steps }: PageProps) {
    const items = steps.map((step, _) => {
        if (tileIndex >= 0) {
            if (stepIndex == step.index) {
                //当前这个step不需要加链接
                return {
                    title: step.name,
                    description: step.description
                }
            } else {
                return {
                    title: <Link href={`?tileIndex=${tileIndex}&stepIndex=${step.index}`}>{step.name}</Link>,
                    description: step.description
                }
            }
        } else {
            if (stepIndex == step.index) {
                //当前这个step不需要加链接
                return {
                    title: step.name,
                    description: step.description
                }
            } else {
                return {
                    title: <Link href={`?stepIndex=${step.index}`}>{step.name}</Link>,
                    description: step.description
                }
            }
        }
    })
    const current = tileIndex >= 0 ? stepIndex - tileIndex * STEPS_PER_TILE : stepIndex
    return <Steps direction="vertical" size="default" status="process" current={current} items={items} type="default" />
}
