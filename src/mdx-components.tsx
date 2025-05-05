import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Callout, Tabs, Code } from 'nextra/components'
import { GitHubIcon } from 'nextra/icons'
import Test from '@/components/mdx/test'
import QuizImgPaste from './components/mdx/quiz_img_paste'
import { UserJoinClass } from './domain/types'
import { I18nLangKeys } from './i18n'

export const useMDXComponents = (lang: I18nLangKeys, model?: UserJoinClass) => ({
    ...getDocsMDXComponents({
        pre: withIcons(Pre, { js: GitHubIcon }),
        $Tabs: Tabs,
        Callout,
        Code,
        Pre,
        Test: (props: any) => <Test lang={lang} model={model} {...props} />,
        QuizImgPaste: (props: any) => <QuizImgPaste lang={lang} model={model} {...props} />
    })
})
