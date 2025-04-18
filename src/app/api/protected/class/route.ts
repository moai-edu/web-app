import { withAuth } from '@/lib/api_handler'
import { classDao } from '@/persist/db'

export const POST = withAuth(async (request, session) => {
    // 解析请求体中的JSON数据
    const { name, courseId } = await request.json()
    const userId = session.user!.id!

    // 创建新班级
    const newClass = {
        id: crypto.randomUUID(),
        name,
        userId,
        courseId
    }

    // 保存到数据库
    const savedClass = await classDao.create(newClass)

    return {
        status: 200,
        data: savedClass
    }
})
