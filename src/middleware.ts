// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { middleware as nextraMiddleware } from 'nextra/locales'

export function middleware(request: NextRequest) {
    // const { pathname } = request.nextUrl

    // // 1. 如果是根路径 `/`，重定向到 `/content/zh`
    // if (pathname === '/') {
    //     const locale = 'zh' // 默认语言，可根据请求头动态判断
    //     return NextResponse.redirect(new URL(`/content/${locale}`, request.url))
    // }

    // 2. 其他路由交给 Nextra 处理（语言切换等）
    return nextraMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img|_pagefind).*)']
}
