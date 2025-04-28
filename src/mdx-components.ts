import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Callout, Tabs, Code } from 'nextra/components'
import { GitHubIcon } from 'nextra/icons'
import Test from './components/mdx/test'
import QuizImgPaste from './components/mdx/quiz_img_paste'

export const useMDXComponents: typeof getDocsMDXComponents = () => ({
    ...getDocsMDXComponents({
        pre: withIcons(Pre, { js: GitHubIcon }),
        $Tabs: Tabs,
        Callout,
        Test,
        QuizImgPaste,
        Code,
        Pre
    })
})
