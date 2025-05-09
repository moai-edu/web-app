import { Container, Flex } from '@radix-ui/themes'
import { Collapse, CollapseProps } from 'antd'
import { Class, UserJoinClass } from '@/domain/types'
import PasteImgSubmit from './quiz_img_paste/paste_img_submit'
import PasteImgStat from './quiz_img_paste/paste_img_stat'
import { I18nLangKeys } from '@/i18n'

interface Props {
    lang: I18nLangKeys
    klass?: Class
    userJoinClass?: UserJoinClass
    id: string
    title: string
    children?: React.ReactNode
}

export default function QuizImgPaste({ lang, klass, userJoinClass, id, title, children }: Props) {
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: title,
            children: (
                <Flex direction="column" gap="3">
                    <Container>{children}</Container>
                    {userJoinClass && <PasteImgSubmit userJoinClass={userJoinClass} quizId={id} />}
                    {!userJoinClass && klass && <PasteImgStat lang={lang} klass={klass} quizId={id} />}
                </Flex>
            )
        }
    ]

    return <Collapse items={items} defaultActiveKey={['1']} />
}
