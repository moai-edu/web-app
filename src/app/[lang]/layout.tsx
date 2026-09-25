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
    // Next.js 16 生成的 LayoutProps 会把 [lang] 段推导为 string，
    // 这里按 string 接收后再收窄成项目支持的语言
    params: Promise<{ lang: string }>
}

export default async function RootLayout({ children, params }: Props) {
    const { lang: rawLang } = await params
    const lang = rawLang as I18nLangKeys
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
