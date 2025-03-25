import { Flex, Text, TextField, Button } from '@radix-ui/themes'
import { BizUser } from './page'

export default function EditUserForm({
    user,
    onSave,
    onCancel
}: {
    user: BizUser
    onSave: () => void
    onCancel: () => void
}) {
    return (
        <>
            <Flex direction="column" gap="3">
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        姓名
                    </Text>
                    <TextField.Root
                        defaultValue={user.name}
                        placeholder="请输入用户姓名"
                    />
                </label>
                <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                        slug
                    </Text>
                    <TextField.Root
                        defaultValue={user.slug}
                        placeholder="请输入slug"
                    />
                </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" onClick={onCancel}>
                    取消
                </Button>
                <Button onClick={onSave}>保存</Button>
            </Flex>
        </>
    )
}
