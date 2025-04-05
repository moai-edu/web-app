import { propagateServerField } from 'next/dist/server/lib/render-server'
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Callout, Tabs } from 'nextra/components'
import { GitHubIcon } from 'nextra/icons'

export const useMDXComponents: typeof getDocsMDXComponents = () => ({
    ...getDocsMDXComponents({
        pre: withIcons(Pre, { js: GitHubIcon }),
        $Tabs: Tabs,
        Callout
    })
})
