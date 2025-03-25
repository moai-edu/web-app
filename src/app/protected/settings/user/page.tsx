'use client'

import { Flex, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import ViewUserDataList from './view_user_data_list'
import EditUserForm from './edit_user_form'
import { BizUser } from '@/app/domain/types'

export default function Page() {
    const [user, setUser] = useState<BizUser | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        async function fetchUserProfile() {
            const res = await fetch('/api/protected/user')
            const data = await res.json()
            setUser(data)
        }
        fetchUserProfile()
    }, [])

    async function handleSave(user: BizUser) {
        const res = await fetch('/api/protected/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        if (res.ok) {
            window.location.reload()
        } else {
            console.error('Failed to save user data')
        }
    }

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
                    onSave={handleSave}
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
