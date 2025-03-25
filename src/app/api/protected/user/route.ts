import { BizUser } from '@/app/domain/types'
import { auth } from '@/auth'
import { bizAdapter } from '@/persist/db'
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
        const userData = await request.json()
        const user: BizUser = {
            ...userData,
            id: session.user!.id!,
            email: session.user!.email!
        }
        // 更新BizUser用户信息
        const updatedUser = await bizAdapter.updateBizUser(user)

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
