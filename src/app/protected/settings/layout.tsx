'use client' // 标记为客户端组件
import { Box, Link, Flex, ScrollArea } from '@radix-ui/themes'
import { usePathname } from 'next/navigation'

export default function SettingLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname() // 获取当前路由路径
    const settings = [
        { name: '账户设置', href: 'user' },
        { name: '版本信息', href: 'version' }
    ]
    return (
        <Flex gap="5">
            <Box width="110px">
                <ScrollArea type="always" scrollbars="vertical">
                    <Flex direction="column" gap="3" mb="5">
                        {settings.map((setting) => (
                            <Link
                                key={setting.href}
                                href={`${setting.href}`}
                                weight={
                                    pathname.endsWith(setting.href)
                                        ? 'bold'
                                        : undefined
                                }
                            >
                                {setting.name}
                            </Link>
                        ))}
                    </Flex>
                </ScrollArea>
            </Box>
            <Box minWidth="400px">{children}</Box>
        </Flex>
    )
}
