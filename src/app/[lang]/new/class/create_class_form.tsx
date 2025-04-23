'use client'
import { Course } from '@/domain/types'
import { Flex, Text, TextField, Button, Box, RadioCards } from '@radix-ui/themes'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createClass } from './actions'
import { createClassSchema } from '@/domain/schemas'
import { z } from 'zod'
import { useLocale } from '@/hooks'

interface Props {
    courseList: Course[]
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

type FormErrors = {
    name?: string[]
    courseId?: string[]
}

const initialState = {
    status: 0,
    errors: {} as FormErrors
}

export default function CreateClassForm({ courseList }: Props) {
    const { t, currentLocale } = useLocale()
    const [state, formAction] = useActionState(createClass, initialState)
    const [formData, setFormData] = useState({
        name: '',
        courseId: courseList[0].id
    })
    const [clientErrors, setClientErrors] = useState<FormErrors>({})

    useEffect(() => {
        if (state.status === 201) {
            window.history.back()
        }
    }, [state.status])

    // 实时客户端验证
    const validateField = (field: keyof typeof formData, value: string) => {
        try {
            // 只验证当前字段
            if (field === 'name') {
                createClassSchema(t).pick({ name: true }).parse({ name: value })
            } else {
                createClassSchema(t).pick({ courseId: true }).parse({ courseId: value })
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

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData((prev) => ({ ...prev, name: value }))
        validateField('name', value)
    }

    const handleCourseChange = (value: string) => {
        setFormData((prev) => ({ ...prev, courseId: value }))
        validateField('courseId', value)
    }

    // 检查表单是否有效
    const isFormValid = () => {
        return (
            Object.keys(clientErrors).every((key) => !clientErrors[key as keyof FormErrors]?.length) &&
            formData.name.trim() !== '' &&
            formData.courseId.trim() !== ''
        )
    }

    // 合并客户端和服务器端错误
    const getFieldErrors = (field: keyof FormErrors) => {
        const serverErrors = state.errors[field] || []
        const clientSideErrors = clientErrors[field] || []
        return [...new Set([...serverErrors, ...clientSideErrors])]
    }

    function onCancel() {
        window.history.back()
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="lang" value={currentLocale} />
            <input type="hidden" name="courseId" value={formData.courseId} />

            <Flex direction="column" gap="4">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        {t('name')}
                    </Text>
                    <TextField.Root
                        name="name"
                        value={formData.name}
                        placeholder=""
                        onChange={handleNameChange}
                        color={getFieldErrors('name').length ? 'red' : undefined}
                    />
                    <Flex direction="column" gap="1">
                        {getFieldErrors('name').map((message, index) => (
                            <Text key={index} color="red" size="1">
                                {message}
                            </Text>
                        ))}
                    </Flex>
                </label>

                <Box maxWidth="600px">
                    <Text as="div" size="2" mb="1" weight="bold">
                        {t('course')}
                    </Text>
                    <RadioCards.Root
                        value={formData.courseId}
                        columns={{ initial: '1', sm: '3' }}
                        onValueChange={handleCourseChange}
                    >
                        {courseList.map((item) => (
                            <RadioCards.Item key={item.id} value={item.id}>
                                <Flex direction="column" width="100%" gapY="4">
                                    <Text weight="bold">{item.metadata.title}</Text>
                                    <Text>{item.metadata.description}</Text>
                                </Flex>
                            </RadioCards.Item>
                        ))}
                    </RadioCards.Root>
                    <Flex direction="column" gap="1">
                        {getFieldErrors('courseId').map((message, index) => (
                            <Text key={index} color="red" size="1">
                                {message}
                            </Text>
                        ))}
                    </Flex>
                </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" onClick={onCancel} type="button">
                    {t('cancel')}
                </Button>
                <SubmitButton disabled={!isFormValid()} />
            </Flex>
        </form>
    )
}
