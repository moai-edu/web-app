'use server'

import { ClassDomain } from '@/domain/class_domain'
import { createClassSchema } from '@/domain/schemas'
import { get_t } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { withAuth } from '@/lib/form_action_handler'

export const createClass = withAuth(async (prevState, formData, session) => {
    const { t } = get_t(formData.get('lang') as I18nLangKeys)
    // 从FormData中提取数据
    const rawData = {
        name: formData.get('name') as string,
        courseId: formData.get('courseId') as string
    }

    // 验证数据（包含异步校验）
    const { name, courseId } = await createClassSchema(t).parseAsync(rawData)

    const domain = new ClassDomain()
    const data = await domain.create(session.user!.id!, name, courseId)

    const status = 201
    return { status, data }
})
