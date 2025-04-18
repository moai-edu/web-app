// lib/api-handler.ts
import { auth } from '@/auth'
import { Session } from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

interface ApiHandlerResult<T = any> {
    status: number
    data: T
}

type ApiHandler<T = any> = (request: NextRequest, session: Session) => Promise<ApiHandlerResult<T>>

export function withAuth(handler: ApiHandler) {
    return async (request: NextRequest) => {
        const session = await auth()
        const headers = { 'Content-Type': 'application/json' }
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access, please log in.' }, { status: 401, headers })
        }

        try {
            const { status, data } = await handler(request, session)
            return NextResponse.json(data, {
                status,
                headers
            })
        } catch (error) {
            // 处理Zod校验错误
            if (error instanceof z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))

                return NextResponse.json({ message: 'Data validation failed.', errors }, { status: 400, headers })
            }

            // 处理其它错误
            return NextResponse.json({ message: 'Internal server error.', error: error }, { status: 500, headers })
        }
    }
}
