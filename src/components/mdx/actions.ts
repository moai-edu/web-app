'use server'

import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { UserJoinClass } from '@/domain/types'
import { s3DataClient } from '@/persist/s3'

export type ServerActionResponse = {
    success: boolean
    data?: any
    error?: string
}

export async function uploadFile(model: UserJoinClass, quizId: string, file: File): Promise<ServerActionResponse> {
    try {
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        if (!quizId) {
            return { success: false, error: 'No quizId provided' }
        }

        const domain = new CourseQuizSubmitDomain()
        const submit = await domain.submit(model, quizId)
        // 上传文件到 S3
        const path = `user-join-class/${model.id}/${submit.id}/index.png`
        await s3DataClient.uploadFile(file, path)
        const url = await s3DataClient.getSignedUrl(path)
        return { success: true, data: { url } }
    } catch (error) {
        console.error('Error uploading file:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred while uploading the file'
        }
    }
}
