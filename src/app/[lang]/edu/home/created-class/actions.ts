'use server'

import { ClassDomain } from '@/domain/class_domain'
import { nameZodSchema } from '@/domain/schemas'
import { get_t } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { withAuth } from '@/lib/form_action_handler'

export const updateClassName = withAuth(async (prevState, formData, session) => {
    const { t } = get_t(formData.get('lang') as I18nLangKeys)

    // 从FormData中提取数据
    const rawData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string
    }
    // 验证数据
    const name = await nameZodSchema(t).parseAsync(rawData.name)

    const domain = new ClassDomain()
    // 检查class是否属于当前用户
    const createdClasses = await domain.getListByUserId(session.user!.id!)
    if (!createdClasses.some((c) => c.id === rawData.id)) {
        return {
            status: 403
        }
    }
    // 更新数据库
    const data = await domain.updateName(rawData.id, name)

    return {
        status: 200,
        data
    }
})
