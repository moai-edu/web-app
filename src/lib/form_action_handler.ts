// lib/api-handler.ts
import { auth } from '@/auth'
import { Session } from 'next-auth'
import { z } from 'zod'

type FormActionHandlerResult = { status: number; data?: any }
type FormActionHandler = (prevState: any, formData: FormData, session: Session) => Promise<FormActionHandlerResult>

export function withAuth(handler: FormActionHandler) {
    return async (prevState: any, formData: FormData) => {
        try {
            const session = await auth()
            if (!session?.user?.id) {
                return {
                    status: 401,
                    errors: {}
                }
            }

            const result = await handler(prevState, formData, session)

            return {
                errors: {},
                ...result
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                // 将Zod错误转换为表单错误格式
                const errors = error.errors.reduce((acc: any, err) => {
                    const field = err.path[0]
                    acc[field] = acc[field] || []
                    acc[field].push(err.message)
                    return acc
                }, {})
                return { errors, status: 400 }
            }
            console.log(error)
            return {
                errors: {},
                status: 500
            }
        }
    }
}
