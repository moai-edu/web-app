import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Pre, withIcons, Callout, Tabs, Code } from 'nextra/components'
import { GitHubIcon } from 'nextra/icons'
import Test from '@/components/mdx/test'
import QuizImgPaste from './components/mdx/quiz_img_paste'
import { UserJoinClass } from './domain/types'

export const useMDXComponents = (model?: UserJoinClass) => ({
    ...getDocsMDXComponents({
        pre: withIcons(Pre, { js: GitHubIcon }),
        $Tabs: Tabs,
        Callout,
        Code,
        Pre,
        Test: (props: any) => <Test model={model} {...props} />,
        QuizImgPaste: (props: any) => <QuizImgPaste model={model} {...props} />
    })
})
