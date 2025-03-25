'use client'

import { Flex, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import ViewUserDataList from './view_user_data_list'
import EditUserForm from './edit_user_form'

export interface BizUser {
    id: string
    name: string
    email: string
    slug: string
}

export default function Page() {
    const [user, setUser] = useState<BizUser | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        async function fetchUserProfile() {
            const res = await fetch('/api/user/profile')
            const data = await res.json()
            setUser(data)
        }
        fetchUserProfile()
    }, [])

    if (!user) {
        return (
            <Flex align="center" gap="4">
                <Spinner size="3" />
                正在加载用户信息...
            </Flex>
        )
    }
    return (
        <Flex direction="column" gap="5">
            {isEditing ? (
                <EditUserForm
                    user={user}
                    onCancel={() => setIsEditing(false)}
                    onSave={() => window.location.reload()}
                />
            ) : (
                <ViewUserDataList
                    user={user}
                    onEditClick={() => setIsEditing(true)}
                />
            )}
        </Flex>
    )
}
