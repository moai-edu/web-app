import {
    LessonCompletionSvg0,
    LessonCompletionSvg1,
    LessonCompletionSvg2,
    LessonCompletionSvg3
} from '@/components/Svgs'
import { TileStatus } from '@/domain/types'

export const LessonCompletionSvg = ({
    lessonsCompleted,
    status,
    style = {}
}: {
    lessonsCompleted: number
    status: TileStatus
    style?: React.HTMLAttributes<SVGElement>['style']
}) => {
    if (status !== 'ACTIVE') {
        return null
    }
    switch (lessonsCompleted % 4) {
        case 0:
            return <LessonCompletionSvg0 style={style} />
        case 1:
            return <LessonCompletionSvg1 style={style} />
        case 2:
            return <LessonCompletionSvg2 style={style} />
        case 3:
            return <LessonCompletionSvg3 style={style} />
        default:
            return null
    }
}
