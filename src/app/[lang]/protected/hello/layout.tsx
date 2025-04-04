'use client'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname() // 获取当前路由路径
    console.log(pathname)
    return <SessionProvider>{children}</SessionProvider>
}
