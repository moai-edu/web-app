import { User } from 'next-auth'

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

// 注意：用户User已经定义在next-auth中，这里不再重复定义
/* file: global.d.ts

import 'next-auth' // 确保引入原始类型声明

declare module 'next-auth' {
    interface User {
        slug?: string | null
    }
}
*/

export interface Class {
    id: string
    name: string
    code: string
    userId: string
    courseId: string

    user?: User
    course?: Course
}

export interface UserJoinClass {
    id: string
    joinedAt: Date
    userId: string
    classId: string

    user?: User
    class?: Class
}
