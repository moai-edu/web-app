import { Container, Flex } from '@radix-ui/themes'
import { Collapse, CollapseProps } from 'antd'
import { UserJoinClass } from '@/domain/types'
import PasteImgSubmit from './quiz_img_paste/paste_img_submit'
import PasteImgStat from './quiz_img_paste/paste_img_stat'
import { I18nLangKeys } from '@/i18n'

interface Props {
    lang: I18nLangKeys
    model?: UserJoinClass
    id: string
    title: string
    children?: React.ReactNode
}

export default function QuizImgPaste({ lang, model, id, title, children }: Props) {
    const isClassCreator = model?.userId === model?.class?.userId
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: title,
            children: (
                <Flex direction="column" gap="3">
                    <Container>{children}</Container>
                    {model && <PasteImgSubmit userJoinClassId={model.id} quizId={id} />}
                    {model && isClassCreator && <PasteImgStat lang={lang} userJoinClassId={model.id} quizId={id} />}
                </Flex>
            )
        }
    ]

    return <Collapse items={items} defaultActiveKey={['1']} />
}
