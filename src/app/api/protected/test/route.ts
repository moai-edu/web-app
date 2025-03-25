import { auth } from '@/auth'

export async function GET(req: Request) {
    console.log(req.method) // 打印请求方法，如 GET、POST、PUT、DELETE 等

    // 调用 auth() 获取会话信息
    const session = await auth()

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
