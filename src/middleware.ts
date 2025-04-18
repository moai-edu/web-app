// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { middleware as nextraMiddleware } from 'nextra/locales'

export function middleware(request: NextRequest) {
    // 添加 x-current-path 头部，将路径传递给下游组件
    // let response = nextraMiddleware(request)
    // if (!response) {
    //     response = NextResponse.next()
    // }
    // response.headers.set('x-current-path', request.nextUrl.pathname)
    // return response
    return nextraMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img|_pagefind).*)']
}
