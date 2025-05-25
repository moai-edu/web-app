'use client'

import { Flex, Box, TabNav, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/hooks'

type PageProps = Readonly<{
    children: React.ReactNode
}>

export default function UserLayout({ children }: PageProps) {
    const { t } = useLocale()

    const pathname = usePathname()

    const tabs = [
        { label: t('routeHome.profile'), href: 'profile' },
        { label: t('routeHome.course'), href: 'course' },
        { label: t('routeHome.joinedClass'), href: 'joined-class' },
        { label: t('routeHome.createdClass'), href: 'created-class' }
    ]

    return (
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
    )
}
