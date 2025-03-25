'use client'
import { Button, DataList, Flex, Link } from '@radix-ui/themes'
import { User } from 'next-auth'

export default function ViewUserDataList({
    user,
    onEditClick
}: {
    user: User
    onEditClick: () => void
}) {
    return (
        <Flex direction="column" gap="3">
            <DataList.Root className="py-8">
                <DataList.Item>
                    <DataList.Label minWidth="88px">ID</DataList.Label>
                    <DataList.Value>{user.id}</DataList.Value>
                </DataList.Item>
                <DataList.Item>
                    <DataList.Label minWidth="88px">姓名</DataList.Label>
                    <DataList.Value>{user.name}</DataList.Value>
                </DataList.Item>
                <DataList.Item>
                    <DataList.Label minWidth="88px">邮箱地址</DataList.Label>
                    <DataList.Value>
                        <Link href={`mailto:${user.email}`}>{user.email}</Link>
                    </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                    <DataList.Label minWidth="88px">slug</DataList.Label>
                    <DataList.Value>{user.slug}</DataList.Value>
                </DataList.Item>
            </DataList.Root>
            <Flex gap="3" mt="4" justify="end">
                <Button onClick={onEditClick}>修改账户信息</Button>
            </Flex>
        </Flex>
    )
}
