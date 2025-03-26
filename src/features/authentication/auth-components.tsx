import React from 'react'
import { signIn, signOut } from '@/auth'
import { Button } from '@radix-ui/themes'

export function GetStarted() {
    return (
        <form
            action={async () => {
                'use server'
                await signIn()
            }}
        >
            <Button>登录</Button>
        </form>
    )
}

export function SignOut({
    ...props
}: React.ComponentPropsWithRef<typeof Button>) {
    return (
        <form
            action={async () => {
                'use server'
                await signOut({ redirect: true, redirectTo: '/' })
            }}
            className="w-full"
        >
            <Button {...props}>注销</Button>
        </form>
    )
}
