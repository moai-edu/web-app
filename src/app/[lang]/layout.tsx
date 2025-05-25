import type { I18nLangKeys } from '@/i18n'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getPageMap } from 'nextra/page-map'
import { getDirection } from '../_dictionaries/get-dictionary'

const repo = 'https://github.com/sanyedu/portal-site'

export const metadata = {
    // Define your metadata here
    // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
    metadataBase: new URL(repo),
    icons: '/img/favicon.svg'
} satisfies Metadata

interface Props {
    children: ReactNode
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function RootLayout({ children, params }: Props) {
    const { lang } = await params
    // const dictionary = await getDictionary(lang)
    const pageMap = await getPageMap(lang)

    const title = 'Moai'
    const description = 'A Portal Website'

    return (
        <html
            // Not required, but good for SEO
            lang={lang}
            // Required to be set
            // dir="ltr"
            // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
            dir={getDirection(lang)}
            suppressHydrationWarning
        >
            {children}
        </html>
    )
}
