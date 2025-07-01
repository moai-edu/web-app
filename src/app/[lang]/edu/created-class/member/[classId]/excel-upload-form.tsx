'use client'

import { useLocale } from '@/hooks'
import { Button } from '@/components/ui/button'
import { useActionState, useEffect } from 'react'
import { uploadStudentsList } from './actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
    classId: string
    downloadUrl: string | null
}

type FormErrors = {
    file?: string[]
}

const initialState = {
    status: 0,
    errors: {} as FormErrors
}

export function ExcelUploadForm({ classId, downloadUrl }: Props) {
    const { t, currentLocale } = useLocale()
    const [state, formAction] = useActionState(uploadStudentsList, initialState)
    const router = useRouter()

    useEffect(() => {
        if (state.status === 200) {
            // 上传成功后刷新页面
            router.refresh()
        }
    }, [state.status, router])

    return (
        <div className="mb-4">
            <form id="uploadForm" action={formAction}>
                <div className="flex gap-4 items-center">
                    <input type="hidden" name="lang" value={currentLocale} />
                    <input type="hidden" name="classId" value={classId} />
                    <input
                        id="fileInput"
                        type="file"
                        name="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={async (e) => {
                            const form = document.getElementById(
                                'uploadForm'
                            ) as HTMLFormElement
                            if (e.target.files && e.target.files.length > 0) {
                                // 自动提交表单
                                form.submit()
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            // 触发隐藏的文件输入点击
                            document.getElementById('fileInput')?.click()
                        }}
                    >
                        上传学生名单
                    </Button>
                    {/* 隐藏的提交按钮 */}
                    <button type="submit" className="hidden" />
                </div>
            </form>
            {downloadUrl && (
                <div className="mt-4">
                    <Link
                        href={downloadUrl}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        下载已上传的学生名单
                    </Link>
                </div>
            )}
        </div>
    )
}
