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
