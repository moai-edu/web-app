import { auth } from '@/auth'

export async function GET() {
    // 调用 auth() 获取会话信息
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
    // 返回用户会话信息
    return new Response(
        JSON.stringify({
            message: 'You are authorized to access this API.',
            user: session!.user
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}
