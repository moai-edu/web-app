'use client'

import { Image, Alert } from 'antd'
import { useState, useEffect } from 'react'
import { useLocale } from '@/hooks'
import { getQuizImgPasteSubmit, submitQuizImgPaste } from './actions'

interface ImageData {
    src: string
    submitId?: string // 保存提交ID以便后续使用
}

interface Props {
    userJoinClassId: string
    quizId: string
}

export default function PasteImgSubmit({ userJoinClassId, quizId }: Props) {
    const [imageData, setImageData] = useState<ImageData | null>(null)
    const [placeHolderText, setPlaceHolderText] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { t } = useLocale()

    // 加载上次上传的图片
    useEffect(() => {
        const loadLastImage = async () => {
            try {
                const result = await getQuizImgPasteSubmit(userJoinClassId, quizId)

                if (result.success && result.data?.url) {
                    setImageData({
                        src: result.data.url,
                        submitId: result.data.submitId
                    })
                }
            } catch (error) {
                console.error('加载上次上传图片失败:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadLastImage()
    }, [userJoinClassId, quizId])

    async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
        const items = event.clipboardData.items
        let file: File | null = null
        let imageType: string | undefined = undefined

        // 重置错误状态
        setError(null)

        // Find pasted image among pasted items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === 0) {
                imageType = items[i].type
                file = items[i].getAsFile()
                break
            }
        }

        if (!file || !imageType) {
            setError('剪贴板中没有找到有效的图片')
            return
        }

        const ext = imageType.split('/')[1]
        const uploadFileName = `${quizId}.${ext}`

        setIsUploading(true)

        try {
            // 创建新的 Blob 对象
            const blob = new Blob([file], { type: imageType })
            const uploadFileObj = new File([blob], uploadFileName, {
                type: imageType
            })

            // 调用 server action 上传文件
            const result = await submitQuizImgPaste(userJoinClassId, quizId, uploadFileObj)

            if (result.success) {
                console.log(`上传图片成功: ${uploadFileName}`)
                setImageData({
                    src: URL.createObjectURL(file),
                    submitId: result.data?.submitId
                })
            } else {
                throw new Error(result.error || '上传图片失败')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '上传过程中发生未知错误'
            console.error('上传错误:', errorMessage)
            setError(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>
            <textarea
                placeholder={isLoading ? t('loading') : isUploading ? t('uploading') : t('howToPaste')}
                onPaste={handlePaste}
                onChange={() => {
                    setPlaceHolderText('')
                    setError(null) // 清空输入时也清空错误
                }}
                value={placeHolderText}
                className="h-10 w-full"
                disabled={isUploading || isLoading}
            ></textarea>
            {isLoading ? (
                <div>{t('loading')}</div>
            ) : (
                <>
                    <Image alt="pasted image" width={150} height={150} src={imageData?.src || '/img/placeholder.svg'} />
                    {isUploading && <span>{t('uploading')}</span>}
                    {error && (
                        <Alert
                            message={t('failed')}
                            description={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError(null)}
                        />
                    )}
                </>
            )}
        </>
    )
}
