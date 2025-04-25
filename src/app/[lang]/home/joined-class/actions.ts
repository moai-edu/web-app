'use server'

import { UserJoinClassDomain } from '@/domain/joined_class_domain'
import { uuidZodSchema } from '@/domain/schemas'
import { get_t } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { withAuth } from '@/lib/form_action_handler'

export const userJoinClass = withAuth(async (prevState, formData, session) => {
    const { t } = get_t(formData.get('lang') as I18nLangKeys)

    // 验证数据（包含异步校验）
    const code = await uuidZodSchema(t).parseAsync(formData.get('invitationCode') as string)

    const domain = new UserJoinClassDomain()
    const data = await domain.userJoinClassByCode(session.user!.id!, code)

    const status = 201
    return { status, data }
})
