// src/middleware.ts
import { NextRequest } from 'next/server'
import { middleware as nextraMiddleware } from 'nextra/locales'

export function middleware(request: NextRequest) {
    const response = nextraMiddleware(request)
    // if (response) {
    //     response.headers.set('Access-Control-Allow-Origin', '*')
    // }
    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img|_pagefind).*)']
}
