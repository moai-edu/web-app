'use client'

import { updateUserClientSchema } from '@/domain/schemas'
import { Flex, Text, TextField, Button } from '@radix-ui/themes'
import { User } from 'next-auth'
import { useState } from 'react'
import { z } from 'zod'

type FormErrors = {
    name?: string[]
    slug?: string[]
}

export default function EditUserForm({ user, onCancel }: { user: User; onCancel: () => void }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        slug: user.slug || ''
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 实时校验单个字段
    const validateField = (field: keyof typeof formData, value: string) => {
        try {
            // 只校验当前字段
            if (field === 'name') {
                updateUserClientSchema.pick({ name: true }).parse({ name: value })
            } else {
                updateUserClientSchema.pick({ slug: true }).parse({ slug: value })
            }
            // 清除该字段的错误
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        } catch (error) {
            if (error instanceof z.ZodError) {
                // 提取该字段的错误信息
                const fieldErrors = error.errors.map((err) => err.message)
                setErrors((prev) => ({ ...prev, [field]: fieldErrors }))
            }
        }
    }

    // 表单字段变更处理
    const handleChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData((prev) => ({ ...prev, [field]: value }))
        // 实时校验
        validateField(field, value)
    }

    // 提交表单
    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // 提交前整体校验
            updateUserClientSchema.parse(formData)

            const res = await fetch('/api/protected/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                window.location.reload()
            } else {
                const errorData = await res.json()
                // 处理API返回的错误
                if (errorData.errors) {
                    const apiErrors = errorData.errors.reduce((acc: FormErrors, err: any) => {
                        acc[err.field as keyof FormErrors] = [err.message]
                        return acc
                    }, {})
                    setErrors(apiErrors)
                } else {
                    setErrors({
                        slug: ['保存失败，请稍后重试']
                    })
                }
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                // 将Zod错误转换为表单错误格式
                const newErrors = error.errors.reduce((acc: FormErrors, err) => {
                    const field = err.path[0] as keyof FormErrors
                    acc[field] = acc[field] || []
                    acc[field]!.push(err.message)
                    return acc
                }, {})
                setErrors(newErrors)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // 检查表单是否有效
    const isFormValid = () => {
        return Object.keys(errors).every((key) => !errors[key as keyof FormErrors]?.length)
    }

    return (
        <>
            <Flex direction="column" gap="3">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        姓名
                    </Text>
                    <TextField.Root
                        value={formData.name}
                        placeholder="请输入用户姓名"
                        onChange={handleChange('name')}
                        color={errors.name ? 'red' : undefined}
                    />
                    {errors.name?.map((message, index) => (
                        <Text key={index} color="red" size="1" mt="1">
                            {message}
                        </Text>
                    ))}
                </label>

                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        Slug
                    </Text>
                    <TextField.Root
                        value={formData.slug}
                        placeholder="请输入slug"
                        onChange={handleChange('slug')}
                        color={errors.slug ? 'red' : undefined}
                    />
                    {errors.slug?.map((message, index) => (
                        <Text key={index} color="red" size="1" mt="1">
                            {message}
                        </Text>
                    ))}
                </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" onClick={onCancel} disabled={isSubmitting}>
                    取消
                </Button>
                <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存'}
                </Button>
            </Flex>
        </>
    )
}
