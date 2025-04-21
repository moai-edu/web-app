import React from 'react'
import { signIn, signOut } from '@/auth'
import { Button } from '@radix-ui/themes'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'

export async function GetStarted({ ...props }: React.ComponentPropsWithRef<typeof Button>) {
    const { t } = await useServerLocale(props.lang as I18nLangKeys)
    return (
        <form
            action={async () => {
                'use server'
                await signIn()
            }}
        >
            <Button>{t('signin')}</Button>
        </form>
    )
}

export async function SignOut({ ...props }: React.ComponentPropsWithRef<typeof Button>) {
    const { t } = await useServerLocale(props.lang as I18nLangKeys)
    return (
        <form
            action={async () => {
                'use server'
                await signOut({ redirect: true, redirectTo: '/' })
            }}
            className="w-full"
        >
            <Button {...props}>{t('signout')}</Button>
        </form>
    )
}
