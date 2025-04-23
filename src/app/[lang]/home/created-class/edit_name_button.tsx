'use client'

import { useLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text, Button, TextField, Callout } from '@radix-ui/themes'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { z } from 'zod'
import { updateClassName } from './actions'
import { nameZodSchema } from '@/domain/schemas'

interface Props {
    id: string
    name: string
    lang: I18nLangKeys
}

type FormErrors = {
    name?: string[]
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

export default function EditNameButton({ id, name: initialName, lang }: Props) {
    const { t } = useLocale()

    const [open, setOpen] = useState(false)
    const [name, setName] = useState(initialName)
    const [clientErrors, setClientErrors] = useState<string[]>([])
    const [state, formAction] = useActionState(updateClassName, initialState)

    // 关闭对话框时重置状态
    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setName(initialName)
            setClientErrors([])
        }
        setOpen(isOpen)
    }

    // 成功提交后关闭对话框
    useEffect(() => {
        if (state.status === 200) {
            setOpen(false)
            window.location.reload()
        }
    }, [state.status])

    // 实时客户端验证
    const validateName = (value: string) => {
        try {
            nameZodSchema(t).parse(value)
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

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        validateName(value)
    }

    // 检查表单是否有效
    const isFormValid = () => {
        return name.trim() !== '' && clientErrors.length === 0
    }

    // 合并客户端和服务器端错误
    const getErrors = () => {
        return [...new Set([...clientErrors, ...(state.errors?.name || [])])]
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger>
                <Button variant="soft">
                    <Pencil2Icon /> {t('edit')}
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <form action={formAction}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={id} />

                    <Dialog.Title>{t('edit')}</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        {t('routeHome.createdClassEditDlgDesc')}
                    </Dialog.Description>

                    {/* 服务器错误显示区域 */}
                    {state.status !== 200 && state.status !== 0 && (
                        <Callout.Root color="red" mb="4">
                            <Callout.Text>{t('error')}</Callout.Text>
                        </Callout.Root>
                    )}

                    <Flex direction="column" gap="3">
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                {t('name')}
                            </Text>
                            <TextField.Root
                                name="name"
                                value={name}
                                onChange={handleNameChange}
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
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">
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
