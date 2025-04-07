import { useServerLocale } from '@/hooks'
import type { I18nLangKeys } from '@/i18n'
import { Link } from '@radix-ui/themes'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params

    const { t } = await useServerLocale(lang)

    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-bold py-4">{t('getStarted')}</h1>
            <Link href={`/${lang}/docs/public`} m="4" size="4">
                公开文档
            </Link>
        </div>
    )
}
