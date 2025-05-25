'use client'

import { uuidZodSchema } from '@/domain/schemas'
import { useLocale } from '@/hooks'
import { PlusIcon } from '@radix-ui/react-icons'
import { Button, Text, TextField, Flex, Dialog } from '@radix-ui/themes'
import { userJoinClass } from './actions'
import { useActionState, useState, useEffect } from 'react'
import { z } from 'zod'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

type FormErrors = {
    invitationCode?: string[]
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
            {pending ? t('submitting') : t('join')}
        </Button>
    )
}

export default function JoinClassDlg() {
    const { t, currentLocale } = useLocale()
    const router = useRouter()
    const [state, formAction] = useActionState(userJoinClass, initialState)
    const [invitationCode, setInvitationCode] = useState('')
    const [clientErrors, setClientErrors] = useState<string[]>([])

    // 成功提交后关闭对话框并刷新页面
    useEffect(() => {
        if (state.status === 201) {
            window.location.reload()
        }
    }, [state.status, router])

    // 实时客户端验证
    const validateInvitationCode = (schema: z.ZodSchema<any>, value: string) => {
        try {
            schema.parse(value)
            setClientErrors([])
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map((err) => err.message)
                setClientErrors(errors)
            }
            return false
        }
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInvitationCode(value)
        validateInvitationCode(uuidZodSchema(t), value)
    }

    // 检查表单是否有效
    const isFormValid = () => {
        return invitationCode.trim() !== '' && clientErrors.length === 0
    }

    // 合并客户端和服务器端错误
    const getErrors = () => {
        return [...new Set([...clientErrors, ...(state.errors?.invitationCode || [])])]
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button>
                    <PlusIcon /> {t('routeHome.routeJoinedClass.join')}
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <form action={formAction}>
                    <input type="hidden" name="lang" value={currentLocale} />

                    <Dialog.Title>{t('routeHome.routeJoinedClass.join')}</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        {t('routeHome.routeJoinedClass.inputClassCode')}
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                {t('invitationCode')}
                            </Text>
                            <TextField.Root
                                name="invitationCode"
                                value={invitationCode}
                                onChange={handleCodeChange}
                                placeholder=""
                                color={getErrors().length ? 'red' : undefined}
                            />
                            <Flex direction="column" gap="1" mt="1">
                                {getErrors().map((error, index) => (
                                    <Text key={index} color="red" size="1">
                                        {error}
                                    </Text>
                                ))}
                            </Flex>
                        </label>
                        {state.status !== 0 && state.status !== 201 && (
                            <Text color="red" size="2" mb="3">
                                {t('error')}
                            </Text>
                        )}
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" type="button">
                                {t('cancel')}
                            </Button>
                        </Dialog.Close>
                        <SubmitButton disabled={!isFormValid()} />
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    )
}
