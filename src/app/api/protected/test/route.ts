import { withAuth } from '@/lib/api_handler'

export const GET = withAuth(async (request, session) => {
    const data = {
        message: 'You are authorized to access this API.',
        user: session!.user
    }
    const status = 200
    return { status, data }
})
