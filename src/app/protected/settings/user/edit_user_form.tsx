import { BizUser } from '@/app/domain/types'
import { Flex, Text, TextField, Button } from '@radix-ui/themes'
import { useState } from 'react'

export default function EditUserForm({
    user,
    onSave,
    onCancel
}: {
    user: BizUser
    onSave: (user: BizUser) => void
    onCancel: () => void
}) {
    const [name, setName] = useState(user.name)
    const [slug, setSlug] = useState(user.slug)

    return (
        <>
            <Flex direction="column" gap="3">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        姓名
                    </Text>
                    <TextField.Root
                        defaultValue={name}
                        placeholder="请输入用户姓名"
                        onChange={(event) => setName(event.target.value)}
                    />
                </label>
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        slug
                    </Text>
                    <TextField.Root
                        defaultValue={slug}
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
                    onClick={() => onSave({ id: '', email: '', name, slug })}
                >
                    保存
                </Button>
            </Flex>
        </>
    )
}
