'use server'

import { nameZodSchema, slugZodSchema } from '@/domain/schemas'
import { UserDomain } from '@/domain/user_domain'
import { get_t } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { withAuth } from '@/lib/form_action_handler'
import { z } from 'zod'

export const updateProfile = withAuth(async (prevState, formData, session) => {
    const { t } = get_t(formData.get('lang') as I18nLangKeys)
    const domain = new UserDomain()

    // 创建带异步校验的schema
    const updateUserSchema = z.object({
        name: nameZodSchema(t),
        slug: slugZodSchema(t).refine(
            async (slug) => {
                const user = await domain.getBySlug(slug)
                return !user || user.id === session.user!.id
            },
            { message: t('occupied') }
        )
    })

    // 从FormData中提取数据
    const rawData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string
    }

    // 验证数据（包含异步校验）
    const { name, slug } = await updateUserSchema.parseAsync(rawData)

    // 直接调用domain更新用户数据
    const data = await domain.update(session.user!.id!, name, slug)
    const status = 200
    return { status, data }
})
