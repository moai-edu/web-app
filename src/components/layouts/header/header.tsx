import React from 'react'
import UserButton from './userButton'
import Image from 'next/image'
import { auth } from '@/auth'
import DarkModeDropDown from './dark-mode-dropdown'
import { TabNav, Link as RadixLink } from '@radix-ui/themes'
import Link from 'next/link'

const Header = async () => {
    const session = await auth()
    return (
        <div className="px-8 py-6 flex items-center justify-between">
            <Link href="/" className="font-medium text-lg flex flex-row items-center gap-3">
                <Image src="/icon-jdenticon-gd-50.svg" alt="icon" width={42} height={42} priority />
                Portal
            </Link>
            <div className="flex items-center gap-4">
                <TabNav.Root>
                    <TabNav.Link href="/docs" active>
                        Documents
                    </TabNav.Link>
                    <TabNav.Link href="/courses">Courses</TabNav.Link>
                </TabNav.Root>
                <UserButton session={session} lang="zh" />
                {session && <RadixLink href="/protected/settings/user">设置</RadixLink>}
                <DarkModeDropDown />
            </div>
        </div>
    )
}
export default Header
