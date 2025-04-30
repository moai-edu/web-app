'use client'

import { Container, Flex } from '@radix-ui/themes'
import { Collapse, CollapseProps, Image, Alert } from 'antd'
import { useState } from 'react'
import { uploadFile } from './actions'
import { UserJoinClass } from '@/domain/types'

interface ImageData {
    src: string
}

interface Props {
    model?: UserJoinClass
    id: string
    title: string
    children?: React.ReactNode
}

export default function QuizImgPaste({ model, id, title, children }: Props) {
    const [imageData, setImageData] = useState<ImageData | null>(null)
    const [placeHolderText, setPlaceHolderText] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handlePasteEmpty() {
        alert('only for demo')
    }

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

        if (!model) {
            setError('未提供用户模型信息')
            return
        }

        if (!file || !imageType) {
            setError('剪贴板中没有找到有效的图片')
            return
        }

        const ext = imageType.split('/')[1]
        const uploadFileName = `${id}.${ext}`

        setIsUploading(true)

        try {
            // 创建新的 Blob 对象
            const blob = new Blob([file], { type: imageType })
            const uploadFileObj = new File([blob], uploadFileName, {
                type: imageType
            })

            // 调用 server action 上传文件
            const result = await uploadFile(model, id, uploadFileObj)

            if (result.success) {
                console.log(`上传图片成功: ${uploadFileName}`)
                setImageData({ src: URL.createObjectURL(file) })
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

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: title,
            children: (
                <Flex direction="column" gap="3">
                    <Container>{children}</Container>
                    <textarea
                        placeholder={isUploading ? '上传中...' : '使用Ctrl+V在这里粘贴图片'}
                        onPaste={model ? handlePaste : handlePasteEmpty}
                        onChange={() => {
                            setPlaceHolderText('')
                            setError(null) // 清空输入时也清空错误
                        }}
                        value={placeHolderText}
                        className="h-10 w-full"
                        disabled={isUploading}
                    ></textarea>
                    <Image alt="pasted image" width={150} height={150} src={imageData?.src || '/img/placeholder.svg'} />
                    {isUploading && <span>上传中...</span>}
                    {error && (
                        <Alert
                            message="上传失败"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError(null)}
                        />
                    )}
                </Flex>
            )
        }
    ]

    return <Collapse items={items} defaultActiveKey={['1']} />
}
