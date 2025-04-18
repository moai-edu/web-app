import { auth } from '@/auth'
import { nameZodSchema, slugZodSchema } from '@/domain/schemas'
import { UserDomain } from '@/domain/user_domain'
import { withAuth } from '@/lib/api_handler'
import { z } from 'zod'

export const PUT = withAuth(async (request, session) => {
    const domain = new UserDomain()
    const updateUserSchema = z.object({
        name: nameZodSchema,
        slug: slugZodSchema.refine(
            async (slug) => {
                // 这里可以添加异步校验逻辑，比如检查slug是否唯一
                const session = await auth()
                const user = await domain.getBySlug(slug)
                // 没人用这个slug，或者就是我自己在用这个slug
                return !user || user.id === session!.user!.id
            },
            { message: '该Slug已被占用' }
        )
    })

    const rawData = await request.json()
    const { name, slug } = await updateUserSchema.parseAsync(rawData)
    const data = await domain.update(session.user!.id!, name, slug)

    return {
        status: 200,
        data
    }
})
