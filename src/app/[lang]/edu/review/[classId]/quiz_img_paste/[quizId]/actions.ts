'use server'

import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { CourseQuizSubmit, CourseQuizSubmitStatus } from '@/domain/types'

export type ServerActionResponse = {
    success: boolean
    data?: CourseQuizSubmit
    error?: string
}

export async function updateStatus(id: string, status: CourseQuizSubmitStatus): Promise<ServerActionResponse> {
    try {
        const domain = new CourseQuizSubmitDomain()
        const submit = await domain.update(id, status)
        return { success: true, data: submit }
    } catch (error) {
        console.error('Error change quiz status:', error)
        return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
}

export async function createWithStatus(
    submit: CourseQuizSubmit,
    status: CourseQuizSubmitStatus
): Promise<ServerActionResponse> {
    try {
        const domain = new CourseQuizSubmitDomain()
        const existed = await domain.getSubmit(submit.userJoinClassId, submit.quizId)
        if (existed) {
            // 如果已经存在提交记录，直接更新状态
            const updatedSubmit = await domain.update(existed.id, submit.status)
            return { success: true, data: updatedSubmit }
        }

        //创建一个CourseQuizSubmit
        submit.id = crypto.randomUUID()
        submit.status = status
        const submited = await domain.create(submit)
        return { success: true, data: submited }
    } catch (error) {
        console.error('Error change quiz status:', error)
        return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
}
