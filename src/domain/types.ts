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
}

export interface UnitStyle {
    backgroundColor: `bg-${string}`
    textColor: `text-${string}`
    borderColor: `border-${string}`
}

export type CourseUnit = {
    name: string
    description: string
    content: string
    steps: CourseStep[] | null
    tiles: Tile[] | null
    style: UnitStyle | null
}

export interface CourseStep {
    name: string
    description: string
    content: string
}

export type TileStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETE'

export type Tile =
    | {
          type: 'star' | 'dumbbell' | 'book' | 'trophy' | 'fast-forward'
          name: string
          description: string
      }
    | { type: 'treasure' }

export type TileType = Tile['type']
