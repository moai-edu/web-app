'use client'

import { Flex, Box, TabNav, Text } from '@radix-ui/themes'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Usable, use } from 'react'

type PageProps = Readonly<{
    children: React.ReactNode
}>

export default function UserLayout({ children }: PageProps) {
    const { t } = useLocale()

    const pathname = usePathname()

    const tabs = [
        { label: t('myProfile'), href: 'profile' },
        { label: t('myCourse'), href: 'course' },
        { label: t('myJoinedClass'), href: 'class-joined' },
        { label: t('myCreatedClass'), href: 'class-created' }
    ]

    return (
        <SessionProvider>
            <Flex direction="column" gap="5">
                <TabNav.Root wrap="wrap">
                    {tabs.map((tab) => (
                        <TabNav.Link key={tab.label} asChild active={pathname.endsWith(tab.href)}>
                            {pathname.endsWith(tab.href) ? (
                                <Text>{tab.label}</Text>
                            ) : (
                                <Link href={`${tab.href}`}>{tab.label}</Link>
                            )}
                        </TabNav.Link>
                    ))}
                </TabNav.Root>
                <Box px="2">{children}</Box>
            </Flex>
        </SessionProvider>
    )
}
