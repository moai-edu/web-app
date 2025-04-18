'use client'

import { Container } from '@radix-ui/themes'
import { useState } from 'react'
import ViewUserDataList from './view_user_data_list'
import EditUserForm from './edit_user_form'
import { useSession } from 'next-auth/react'

export default function Page() {
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const { data: session, status } = useSession()
    const user = session?.user

    if (status === 'loading') {
        // Show a loading state while session is being fetched
        return <h1>Loading...</h1>
    }

    if (!session || !user) {
        // If there's no session, prompt user to log in
        return <h1>Please log in to access this page</h1>
    }

    return (
        <Container size="2" p="4">
            {isEditing ? (
                <EditUserForm user={user!} onCancel={() => setIsEditing(false)} />
            ) : (
                <ViewUserDataList user={user!} onEditClick={() => setIsEditing(true)} />
            )}
        </Container>
    )
}
