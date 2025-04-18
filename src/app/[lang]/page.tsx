import { useServerLocale } from '@/hooks'
import type { I18nLangKeys } from '@/i18n'
import { Link } from '@radix-ui/themes'
import { auth } from '@/auth'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params

    const session = await auth()
    const { t } = await useServerLocale(lang)

    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-bold py-4">{t('getStarted')}</h1>
            {session && session.user && (
                <Link href={`/${lang}/home/profile`} m="4" size="4">
                    {t('userHomePage')}
                </Link>
            )}
        </div>
    )
}
