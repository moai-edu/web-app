'use client'
import { Course } from '@/domain/types'
import { Flex, Text, TextField, Button, Container, Box, RadioCards } from '@radix-ui/themes'
import { useState } from 'react'

interface Props {
    courseList: Course[]
}

export default function CreateClassForm({ courseList }: Props) {
    const [name, setName] = useState<string | null | undefined>('')
    const [courseId, setCourseId] = useState<string>(courseList[0].id)

    const [isNameDuplicateErrorVisible, setIsNameDuplicateErrorVisible] = useState<boolean>(false)
    const [isNameFormatErrorVisible, setIsNameFormatErrorVisible] = useState<boolean>(false)

    async function onSaveClick() {
        setIsNameFormatErrorVisible(false)
        setIsNameDuplicateErrorVisible(false)

        if (!name) {
            setIsNameFormatErrorVisible(true)
            return
        }

        const res = await fetch('/api/protected/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                courseId
            })
        })
        if (res.ok) {
            window.history.back()
        } else {
            setIsNameDuplicateErrorVisible(true)
            console.error('Failed to create class')
            return false
        }
    }

    function onCancel() {
        window.history.back()
    }

    return (
        <>
            <Flex direction="column" gap="4">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        班级名称：
                    </Text>
                    <TextField.Root
                        defaultValue={name!}
                        placeholder="输入班级名称"
                        onChange={(event) => setName(event.target.value)}
                    />
                    {isNameFormatErrorVisible && <Text color="crimson">班级名称不能为空</Text>}
                    {isNameDuplicateErrorVisible && <Text color="crimson">名称已被占用</Text>}
                </label>
                <Box maxWidth="600px">
                    <Text as="div" size="2" mb="1" weight="bold">
                        选择课程：
                    </Text>
                    <RadioCards.Root
                        defaultValue={courseId}
                        columns={{ initial: '1', sm: '3' }}
                        onValueChange={setCourseId}
                    >
                        {courseList.map((item, index) => (
                            <RadioCards.Item key={index} value={item.id}>
                                <Flex direction="column" width="100%" gapY="4">
                                    <Text weight="bold">{item.metadata.title}</Text>
                                    <Text>{item.metadata.description}</Text>
                                </Flex>
                            </RadioCards.Item>
                        ))}
                    </RadioCards.Root>
                </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" onClick={onCancel}>
                    取消
                </Button>
                <Button onClick={() => onSaveClick()}>保存</Button>
            </Flex>
        </>
    )
}
