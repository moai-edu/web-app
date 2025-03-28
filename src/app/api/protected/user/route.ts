import { auth } from '@/auth'
import { dbAdapter } from '@/persist/db'
import { NextResponse } from 'next/server'

// BizUser的更新信息通过JSON格式传递
export async function PUT(request: Request) {
    const session = await auth()

    if (!session) {
        // 如果用户未登录或会话不存在，返回 401 未授权状态
        return new Response(
            JSON.stringify({ message: 'Unauthorized access. Please log in.' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }

    try {
        // 解析请求体中的JSON数据
        const { name, slug } = await request.json()

        if (slug && ['public'].includes(slug)) {
            // 不能使用保留的slug
            return new Response(
                JSON.stringify({ message: 'Slug has been taken.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        if (slug && slug !== session.user!.slug) {
            const existedUser = await dbAdapter.getUserBySlug(slug)
            if (existedUser) {
                // 如果slug已被占用，返回 400 错误状态
                return new Response(
                    JSON.stringify({ message: 'Slug has been taken.' }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            }
        }

        // 更新User用户的name和slug
        const updatedUser = await dbAdapter.updateUser(
            session.user!.id!,
            name,
            slug
        )

        // 返回更新后的用户信息
        return NextResponse.json(updatedUser, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        // 处理错误
        return new Response(
            JSON.stringify({ message: 'Failed to update user.', error: error }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}
