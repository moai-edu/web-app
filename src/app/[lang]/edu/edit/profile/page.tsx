'use client'

import { useLocale } from '@/hooks'
import { Flex, Text, TextField, Button, Container } from '@radix-ui/themes'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { z } from 'zod'
import { updateProfile } from './actions'
import { updateUserSchema } from '@/domain/schemas'

type FormErrors = {
    name?: string[]
    slug?: string[]
}

const initialState = {
    status: 0,
    errors: {} as FormErrors
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus()
    const { t } = useLocale()

    return (
        <Button type="submit" disabled={disabled || pending}>
            {pending ? t('submitting') : t('save')}
        </Button>
    )
}

export default function Page() {
    const { data: session, status } = useSession()
    const { t, currentLocale } = useLocale()
    const [formData, setFormData] = useState({
        name: '',
        slug: ''
    })
    const [clientErrors, setClientErrors] = useState<FormErrors>({})
    const [state, formAction] = useActionState(updateProfile, initialState)

    useEffect(() => {
        if (session && session.user) {
            setFormData({
                name: session.user.name || '',
                slug: session.user.slug || ''
            })
            // // 初始化时也验证字段
            // validateField('name', session.user.name || '')
            // validateField('slug', session.user.slug || '')
        }
    }, [session])

    useEffect(() => {
        if (state.status === 200) {
            window.history.back()
        }
    }, [state.status])

    if (status === 'loading') {
        return <div>Loading...</div>
    }
    if (status === 'unauthenticated') {
        return <div>Not authenticated</div>
    }

    // 实时客户端验证
    const validateField = (field: keyof typeof formData, value: string) => {
        try {
            // 只验证当前字段
            if (field === 'name') {
                updateUserSchema(t).pick({ name: true }).parse({ name: value })
            } else {
                updateUserSchema(t).pick({ slug: true }).parse({ slug: value })
            }
            // 清除该字段的错误
            setClientErrors((prev) => ({ ...prev, [field]: undefined }))
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = error.errors.map((err) => err.message)
                setClientErrors((prev) => ({ ...prev, [field]: fieldErrors }))
            }
            return false
        }
    }

    const handleChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData((prev) => ({ ...prev, [field]: value }))
        // 实时验证
        validateField(field, value)
    }

    // 检查表单是否有效（仅使用客户端错误判断按钮状态）
    const isFormValid = () => {
        return (
            Object.keys(clientErrors).every((key) => !clientErrors[key as keyof FormErrors]?.length) &&
            formData.name &&
            formData.slug
        ) // 确保字段不为空
    }

    // 合并客户端和服务器端错误
    const getFieldErrors = (field: keyof FormErrors) => {
        const serverErrors = state.errors[field] || []
        const clientSideErrors = clientErrors[field] || []
        return [...new Set([...serverErrors, ...clientSideErrors])] // 使用Set去重
    }

    function onCancel() {
        window.history.back()
    }

    return (
        <Container size="2" p="4">
            <form action={formAction}>
                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            {t('fullname')}
                        </Text>
                        <TextField.Root
                            name="name"
                            value={formData.name}
                            placeholder=""
                            onChange={handleChange('name')}
                            color={getFieldErrors('name').length ? 'red' : undefined}
                        />
                        <Flex direction="column" gap="1">
                            {getFieldErrors('name').map((message: string, index: number) => (
                                <Text key={index} color="red" size="1" mt="1">
                                    {message}
                                </Text>
                            ))}
                        </Flex>
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            {t('slug')}
                        </Text>
                        <TextField.Root
                            name="slug"
                            value={formData.slug}
                            placeholder=""
                            onChange={handleChange('slug')}
                            color={getFieldErrors('slug').length ? 'red' : undefined}
                        />
                        <Flex direction="column" gap="1">
                            {getFieldErrors('slug').map((message: string, index: number) => (
                                <Text key={index} color="red" size="1" mt="1">
                                    {message}
                                </Text>
                            ))}
                        </Flex>
                    </label>
                </Flex>

                <input type="hidden" name="lang" value={currentLocale} />
                <Flex gap="3" mt="4" justify="end">
                    <Button variant="soft" onClick={onCancel} type="button">
                        {t('cancel')}
                    </Button>
                    <SubmitButton disabled={!isFormValid()} />
                </Flex>
            </form>
        </Container>
    )
}
