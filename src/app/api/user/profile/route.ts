import { NextResponse } from 'next/server'

// 动态导入 AWS SDK 并获取版本号
export async function GET() {
    return NextResponse.json({
        id: '123456',
        name: '张三',
        email: 'zs@qq.com',
        slug: 'zhangsan'
    })
}
