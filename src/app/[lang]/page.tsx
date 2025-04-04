import { useServerLocale } from '@/hooks'
import type { I18nLangKeys } from '@/i18n'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params

    const { t } = await useServerLocale(lang)

    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-bold">{t('getStarted')}</h1>
        </div>
    )
}
