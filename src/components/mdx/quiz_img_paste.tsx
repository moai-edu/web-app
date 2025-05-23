import { Container, Flex, Link } from '@radix-ui/themes'
import { Collapse, CollapseProps } from 'antd'
import { Class, UserJoinClass } from '@/domain/types'
import PasteImgSubmit from './quiz_img_paste/paste_img_submit'
import PasteImgStat from './quiz_img_paste/paste_img_stat'
import { I18nLangKeys } from '@/i18n'
import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { useServerLocale } from '@/hooks'

interface Props {
    lang: I18nLangKeys
    klass?: Class
    userJoinClass?: UserJoinClass
    id: string
    title: string
    children?: React.ReactNode
}

export default async function QuizImgPaste({ lang, klass, userJoinClass, id, title, children }: Props) {
    const { t } = await useServerLocale(lang)
    console.log(`lang: ${lang}, klass: ${klass}, userJoinClass: ${userJoinClass}, id: ${id}`)

    let extraComponents = null // 默认只显示quiz信息，而不显示任何额外组件
    if (userJoinClass) {
        // 如果加入了班级，额外要显示提交控件
        extraComponents = <PasteImgSubmit userJoinClass={userJoinClass} quizId={id} />
    } else if (klass) {
        // 如果访问者没加入班级并且是班级是创建者，额外显示链接到review的统计信息
        const domain = new CourseQuizSubmitDomain()
        const stat = await domain.getQuizStatistics(klass, id)
        extraComponents = (
            <Link href={`/review/${klass.id}/quiz_img_paste/${id}`} target="_blank">
                <PasteImgStat stat={stat} />
            </Link>
        )
    }

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: `${title}(${t('id')}: ${id})`,
            children: (
                <Flex direction="column" gap="3">
                    <Container>{children}</Container>
                    {extraComponents}
                </Flex>
            )
        }
    ]
    return <Collapse items={items} defaultActiveKey={['1']} />
}
