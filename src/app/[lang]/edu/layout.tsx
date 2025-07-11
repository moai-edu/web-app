import '@ant-design/v5-patch-for-react-19'
import type { I18nLangAsyncProps, I18nLangKeys } from '@/i18n'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { CustomFooter } from '@/components/CustomFooter'
import { useServerLocale } from '@/hooks'
import LocaleToggle from '@/widgets/locale-toggle'
import ThemeToggle from '@/widgets/theme-toggle'
import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

import { ThemeProvider } from '@/components/ThemeProvider'

import { auth } from '@/auth'
import { Link as RadixLink, Theme } from '@radix-ui/themes'
import UserButton from '@/components/layouts/header/userButton'
import { Head } from 'nextra/components'
import { SessionProvider } from 'next-auth/react'

import './styles/index.css'

const repo = 'https://github.com/sanyedu/portal-site'

export const metadata = {
    // Define your metadata here
    // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
    metadataBase: new URL(repo),
    icons: '/img/favicon.svg'
} satisfies Metadata

const CustomBanner = async ({ lang }: I18nLangAsyncProps) => {
    const { t } = await useServerLocale(lang)
    return (
        <Banner storageKey="starter-banner">
            <div className="flex justify-center items-center gap-1">
                {t('banner.title')}{' '}
                <a className="max-sm:hidden text-warning hover:underline" target="_blank" href={repo}>
                    {t('banner.more')}
                </a>
            </div>
        </Banner>
    )
}

const CustomNavbar = async ({ lang }: I18nLangAsyncProps) => {
    const session = await auth()
    const { t } = await useServerLocale(lang)
    return (
        <Navbar logo={<span>{t('systemTitle')}</span>} logoLink={`/${lang}`} projectLink={repo}>
            <>
                <UserButton session={session} lang={lang} />
                <LocaleToggle className="max-md:hidden" />
                <ThemeToggle className="max-md:hidden" />
            </>
        </Navbar>
    )
}

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

    const { t } = await useServerLocale(lang)

    return (
        <>
            <Head
            // ... Your additional head options
            >
                {/* <title>{asPath !== '/' ? `${normalizePagesResult.title} - ${title}` : title}</title> */}
                <meta property="og:title" content={title} />
                <meta name="description" content={description} />
                <meta property="og:description" content={description} />
                <link rel="canonical" href={repo} />
            </Head>
            <body>
                <SessionProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        storageKey="starter-theme-provider"
                        disableTransitionOnChange
                    >
                        <Theme>
                            <AntdRegistry>
                                <ConfigProvider
                                    theme={{
                                        cssVar: true,
                                        token: {
                                            colorBgElevated: 'var(--color-background)',
                                            colorText: 'var(--color-foreground)',
                                            colorTextSecondary: 'var(--color-secondary-foreground)',
                                            colorTextDescription: 'var(--color-secondary-foreground)',
                                            colorBgContainer: 'var(--color-background)'
                                        }
                                    }}
                                >
                                    <Layout
                                        banner={<CustomBanner lang={lang} />}
                                        navbar={<CustomNavbar lang={lang} />}
                                        lastUpdated={<LastUpdated>{t('lastUpdated')}</LastUpdated>}
                                        editLink={null}
                                        docsRepositoryBase={repo}
                                        footer={
                                            <Footer className="bg-background py-5!">
                                                <CustomFooter />
                                            </Footer>
                                        }
                                        search={<Search />}
                                        i18n={[
                                            { locale: 'en', name: 'English' },
                                            { locale: 'zh', name: '简体中文' }
                                        ]}
                                        pageMap={pageMap}
                                        feedback={{ content: '' }}
                                        // ... Your additional layout options
                                    >
                                        {children}
                                    </Layout>
                                </ConfigProvider>
                            </AntdRegistry>
                        </Theme>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </>
    )
}
