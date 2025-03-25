import { auth } from '@/auth'

// src/app/hello/page.tsx
export default async function HelloPage() {
    const session = await auth()
    if (!session?.user) return null

    return (
        <div>
            <h1>Hello, World!</h1>
        </div>
    )
}
