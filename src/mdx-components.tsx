import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Callout, Tabs, Code } from 'nextra/components'
import { GitHubIcon } from 'nextra/icons'
import QuizImgPaste from './components/mdx/quiz_img_paste'
import { Class, UserJoinClass } from './domain/types'
import { I18nLangKeys } from './i18n'

export const useMDXComponents = (lang: I18nLangKeys, klass?: Class, userJoinClass?: UserJoinClass) => ({
    ...getDocsMDXComponents({
        pre: withIcons(Pre, { js: GitHubIcon }),
        $Tabs: Tabs,
        Callout,
        Code,
        Pre,
        QuizImgPaste: (props: any) => (
            <QuizImgPaste lang={lang} klass={klass} userJoinClass={userJoinClass} {...props} />
        )
    })
})
