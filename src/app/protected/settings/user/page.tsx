'use client'

import { Flex } from '@radix-ui/themes'
import { useState } from 'react'
import ViewUserDataList from './view_user_data_list'
import EditUserForm from './edit_user_form'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'

export default function Page() {
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const { data: session, status } = useSession()
    const user = session?.user

    async function handleSave(user: User) {
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

    if (status === 'loading') {
        // Show a loading state while session is being fetched
        return <h1>Loading...</h1>
    }

    if (!session || !user) {
        // If there's no session, prompt user to log in
        return <h1>Please log in to access this page</h1>
    }

    return (
        <Flex direction="column" gap="5">
            {isEditing ? (
                <EditUserForm
                    user={user!}
                    onCancel={() => setIsEditing(false)}
                    onSave={handleSave}
                />
            ) : (
                <ViewUserDataList
                    user={user!}
                    onEditClick={() => setIsEditing(true)}
                />
            )}
        </Flex>
    )
}
