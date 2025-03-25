'use client'
import { Flex, Text, TextField, Button } from '@radix-ui/themes'
import { User } from 'next-auth'
import { useState } from 'react'

export default function EditUserForm({
    user,
    onSave,
    onCancel
}: {
    user: User
    onSave: (user: User) => void
    onCancel: () => void
}) {
    const [name, setName] = useState<string | null | undefined>(user.name)
    const [slug, setSlug] = useState<string | null | undefined>(user.slug)

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
                </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" onClick={onCancel}>
                    取消
                </Button>
                <Button
                    onClick={() =>
                        onSave({ id: '', email: '', name: name!, slug: slug! })
                    }
                >
                    保存
                </Button>
            </Flex>
        </>
    )
}
