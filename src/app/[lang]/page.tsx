import type { I18nLangKeys } from '@/i18n'
import { redirect } from 'next/navigation'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params
    redirect(`/${lang}/edu`)
}
