// types/next-auth.d.ts

import 'next-auth' // 确保引入原始类型声明

declare module 'next-auth' {
    interface User {
        slug: string | null // 为 User 添加 slug 字段
    }
}
