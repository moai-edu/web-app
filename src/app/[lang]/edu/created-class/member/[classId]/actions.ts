'use server'

import { withAuth } from '@/lib/form_action_handler'
import { getStudentXlsxKey } from '@/lib/utils'
import { s3DataClient } from '@/persist/s3'

export const uploadStudentsList = withAuth(
    async (prevState, formData, session) => {
        const file = formData.get('file') as File
        if (!file) {
            throw new Error('No file provided')
        }

        // 检查文件类型
        if (!file.name.endsWith('.xls')) {
            throw new Error('Only Excel (.xls) files are allowed')
        }

        // 上传到S3
        const classId = formData.get('classId') as string
        const xlsxKey = getStudentXlsxKey(classId)

        await s3DataClient.uploadFile(file, xlsxKey)
        console.log(`File uploaded successfully: ${xlsxKey}`)

        const status = 200
        return { status, data: { message: 'File uploaded successfully' } }
    }
)
