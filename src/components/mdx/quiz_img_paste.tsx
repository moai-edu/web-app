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
    if (userJoinClass) {
        // 如果加入了班级，显示提交
        const items: CollapseProps['items'] = [
            {
                key: '1',
                label: title,
                children: (
                    <Flex direction="column" gap="3">
                        <Container>{children}</Container>
                        <PasteImgSubmit userJoinClass={userJoinClass} quizId={id} />
                    </Flex>
                )
            }
        ]

        return <Collapse items={items} defaultActiveKey={['1']} />
    } else if (klass) {
        // 如果访问者没加入班级并且是班级是创建者，显示链接到review的统计信息
        const domain = new CourseQuizSubmitDomain()
        const stat = await domain.getQuizStatistics(klass, id)
        const items: CollapseProps['items'] = [
            {
                key: '1',
                label: `${title}(${t('id')}: ${id})`,
                children: (
                    <Flex direction="column" gap="3">
                        <Container>{children}</Container>
                        <Link href={`/review/${klass.id}/quiz_img_paste/${id}`} target="_blank">
                            <PasteImgStat stat={stat} />
                        </Link>
                    </Flex>
                )
            }
        ]

        return <Collapse items={items} defaultActiveKey={['1']} />
    } else {
        return <div>Error</div>
    }
}
