// src/app/api/mock/oauth2/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
    // 这里直接模拟授权成功，生成一个授权码（code）
    const code = 'some_generated_code'
    // 取出回调URL参数，并附加上code参数进行重定向
    const callbackUrl = new URL(request.url)
    const redirectUri = callbackUrl.searchParams.get('redirect_uri') as string

    if (!redirectUri) {
        return NextResponse.json({ message: '缺少redirect_uri参数' }, { status: 400 })
    }

    const finalCallbackUrl = new URL(redirectUri)
    finalCallbackUrl.searchParams.append('code', code)

    return NextResponse.redirect(finalCallbackUrl.toString())
}
