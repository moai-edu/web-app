export interface CourseMetadata {
    title?: string
    description?: string
    cover?: string
    access?: string
}

export interface Course {
    id: string
    metadata: CourseMetadata
    content: string
    units: CourseUnit[] | null
    coverUrl: string | null | undefined
}

export interface UnitStyle {
    backgroundColor: `bg-${string}`
    textColor: `text-${string}`
    borderColor: `border-${string}`
}

export type CourseUnit = {
    index: number
    name: string
    description: string
    content: string
    steps: CourseStep[] | null
    tiles: Tile[] | null
    style: UnitStyle | null
}

export interface CourseStep {
    index: number
    name: string
    description: string
    content: string
}

export type TileStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETE'

export type Tile =
    | {
          index: number
          type: 'star' | 'dumbbell' | 'book' | 'trophy' | 'fast-forward'
          name: string
          description: string
          steps: CourseStep[] | null
      }
    | { index: number; type: 'treasure' }

export type TileType = Tile['type']

//一个tile固定就是4个steps。
// 注意：目前这里只能是4，没有处理其它进度比例的方案，其它值会显示进度异常；
export const STEPS_PER_TILE = 4

export interface Class {
    id: string
    userId: string
    name: string
    courseId: string
    code: string
}

export interface UserJoinClass {
    id: string
    userId: string
    classId: string
    joinedAt: Date
}
