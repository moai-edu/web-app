'use client'
import { Flex, Text, TextField, Button } from '@radix-ui/themes'
import { User } from 'next-auth'
import { useState } from 'react'

export default function EditUserForm({
    user,
    onCancel
}: {
    user: User
    onCancel: () => void
}) {
    const [name, setName] = useState<string | null | undefined>(user.name)
    const [slug, setSlug] = useState<string | null | undefined>(user.slug)
    const [isSlugDuplicateErrorVisible, setIsSlugDuplicateErrorVisible] =
        useState<boolean>(false)
    const [isSlugFormatErrorVisible, setIsSlugFormatErrorVisible] =
        useState<boolean>(false)

    async function onSaveClick() {
        setIsSlugFormatErrorVisible(false)
        setIsSlugDuplicateErrorVisible(false)

        if (!slug || !/^[a-z0-9_-]+$/.test(slug)) {
            setIsSlugFormatErrorVisible(true)
            return
        }

        const res = await fetch('/api/protected/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                slug
            })
        })
        if (res.ok) {
            window.location.reload()
        } else {
            setIsSlugDuplicateErrorVisible(true)
            console.error('Failed to save user data')
            return false
        }
    }

    return (
        <>
            <Flex direction="column" gap="3">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        姓名
                    </Text>
                    <TextField.Root
                        defaultValue={name!}
                        placeholder="请输入用户姓名"
                        onChange={(event) => setName(event.target.value)}
                    />
                </label>
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        slug
                    </Text>
                    <TextField.Root
                        defaultValue={slug!}
                        placeholder="请输入slug"
                        onChange={(event) => setSlug(event.target.value)}
                    />
                    {isSlugFormatErrorVisible && (
                        <Text color="crimson">
                            slug只能包含小写字母、数字、下划线、中划线
                        </Text>
                    )}
                    {isSlugDuplicateErrorVisible && (
                        <Text color="crimson">slug已被占用</Text>
                    )}
                </label>
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
