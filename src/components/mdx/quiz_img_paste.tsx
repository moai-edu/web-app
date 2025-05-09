import { Container, Flex } from '@radix-ui/themes'
import { Collapse, CollapseProps } from 'antd'
import { UserJoinClass } from '@/domain/types'
import PasteImgSubmit from './quiz_img_paste/paste_img_submit'
import PasteImgStat from './quiz_img_paste/paste_img_stat'
import { I18nLangKeys } from '@/i18n'

interface Props {
    lang: I18nLangKeys
    userJoinClass?: UserJoinClass
    quizId: string
    title: string
    children?: React.ReactNode
}

export default function QuizImgPaste({ lang, userJoinClass, quizId, title, children }: Props) {
    const isClassCreator = userJoinClass?.userId === userJoinClass?.class?.userId
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: title,
            children: (
                <Flex direction="column" gap="3">
                    <Container>{children}</Container>
                    {userJoinClass && <PasteImgSubmit userJoinClass={userJoinClass} quizId={quizId} />}
                    {userJoinClass && isClassCreator && (
                        <PasteImgStat lang={lang} userJoinClass={userJoinClass} quizId={quizId} />
                    )}
                </Flex>
            )
        }
    ]

    return <Collapse items={items} defaultActiveKey={['1']} />
}
