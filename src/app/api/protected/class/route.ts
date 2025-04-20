import { ClassDomain } from '@/domain/class_domain'
import { withAuth } from '@/lib/api_handler'

export const POST = withAuth(async (request, session) => {
    // 解析请求体中的JSON数据
    const { name, courseId } = await request.json()
    const userId = session.user!.id!

    // 保存到数据库
    const domain = new ClassDomain()
    const savedClass = await domain.create(userId, name, courseId)

    return {
        status: 200,
        data: savedClass
    }
})
