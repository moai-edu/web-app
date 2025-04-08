export interface CourseMetadata {
    title?: string
    description?: string
    cover?: string
    access?: string
}

export interface Course {
    id: string
    title?: string
    description?: string
    cover?: string
    tasks?: CourseTask[]
    units?: Unit[]
}

export interface CourseTask {
    title: string
    description?: string
    steps?: CourseStep[]
}

export interface CourseStep {
    name: string
    description?: string
    content?: string
}

export type Unit = {
    unitNumber: number
    description: string
    backgroundColor: `bg-${string}`
    textColor: `text-${string}`
    borderColor: `border-${string}`
    tiles: Tile[]
}

export type TileStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETE'

export type Tile =
    | {
          type: 'star' | 'dumbbell' | 'book' | 'trophy' | 'fast-forward'
          description: string
      }
    | { type: 'treasure' }

export type TileType = Tile['type']
