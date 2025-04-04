import { CourseStep } from '@/app/_todo/domain/types'
import { Link } from '@radix-ui/themes'
import { Steps } from 'antd'

export default function TaskSteps({
    current,
    status,
    steps
}: {
    current: number
    status: 'wait' | 'process' | 'finish' | 'error'
    steps: CourseStep[]
}) {
    const items = steps.map((step, index) => {
        return {
            title: <Link href={`?step=${index}`}>{step.name}</Link>,
            description: step.description
        }
    })
    return <Steps direction="vertical" size="default" status={status} current={current} items={items} type="default" />
}
