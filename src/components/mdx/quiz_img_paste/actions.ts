'use server'

import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { UserJoinClass } from '@/domain/types'
import { s3DataClient } from '@/persist/s3'

export type ServerActionResponse = {
    success: boolean
    data?: any
    error?: string
}

export async function submitQuizImgPaste(
    userJoinClass: UserJoinClass,
    quizId: string,
    file: File
): Promise<ServerActionResponse> {
    try {
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        if (!quizId) {
            return { success: false, error: 'No quizId provided' }
        }

        const domain = new CourseQuizSubmitDomain()
        const submit = await domain.submit(userJoinClass, quizId, [])
        // 上传文件到 S3
        const path = domain.getQuizImgPastePath(userJoinClass.id, submit.id)
        await s3DataClient.uploadFile(file, path)
        const url = await s3DataClient.getSignedUrl(path)
        return { success: true, data: { url, submitId: submit.id } }
    } catch (error) {
        console.error('Error uploading file:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred while uploading the file'
        }
    }
}

// 新增：获取用户上次上传的图片
export async function getQuizImgPasteSubmit(userJoinClassId: string, quizId: string): Promise<ServerActionResponse> {
    try {
        if (!quizId) {
            return { success: false, error: 'No quizId provided' }
        }

        const domain = new CourseQuizSubmitDomain()
        const submit = await domain.getSubmit(userJoinClassId, quizId)

        if (!submit) {
            return { success: true, data: null } // 没有上传记录
        }

        const path = domain.getQuizImgPastePath(userJoinClassId, submit.id)
        const url = await s3DataClient.getSignedUrl(path)

        return {
            success: true,
            data: {
                url,
                submitId: submit.id
            }
        }
    } catch (error) {
        console.error('Error getting last uploaded image:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred while fetching the image'
        }
    }
}
