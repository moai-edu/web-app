import { withAuth } from '@/lib/api_handler'
import { classDao } from '@/persist/db'

export const POST = withAuth(async (request, session) => {
    // 解析请求体中的JSON数据
    const { name, courseId } = await request.json()
    // const data = await classDao.create(session.user!.id, name, courseId)

    return {
        status: 200,
        data: null
    }
})
