import { UserJoinClass } from '@/domain/types'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Button } from '@radix-ui/themes'

interface Props {
    lang: I18nLangKeys
    model?: UserJoinClass
}
export default async function Test({ lang, model }: Props) {
    const { t } = await useServerLocale(lang)
    if (!model) return <div>no model</div>
    return (
        <div>
            <code>
                <pre>{JSON.stringify(model, null, 4)}</pre>
            </code>
            <Button>{t('badgeTitle')}</Button>
        </div>
    )
}
