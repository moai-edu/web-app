// import { auth } from '@/auth'
'use client'
import { useSession } from 'next-auth/react'

// src/app/hello/page.tsx
export default function HelloPage() {
    // 解构赋值是一种非常简洁的语法，适用于提取对象或数组中的data数据，并将其赋值给变量session。
    const { data: session } = useSession()

    return <h1>Hello, World! Slug={session?.user?.slug}</h1>
}
