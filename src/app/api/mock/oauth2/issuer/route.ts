// src/app/api/mock/oauth2/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
    console.log(request.url)
    return NextResponse.redirect('/')
}
