import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys, LocaleKeys } from '@/i18n'
import { Grid } from '@radix-ui/themes'
import { Statistic } from 'antd'

interface Props {
    lang: I18nLangKeys
    userJoinClassId: string
    quizId: string
}

export default async function PasteImgStat({ lang, userJoinClassId, quizId }: Props) {
    const { t } = await useServerLocale(lang)
    const domain = new CourseQuizSubmitDomain()
    const stats = await domain.getQuizStatistics(userJoinClassId, quizId)

    const displayStats = [
        { title: 'submitted', value: stats.submitted, suffixValue: stats.totalStudents },
        { title: 'notSubmitted', value: stats.notSubmitted, suffixValue: stats.totalStudents },
        { title: 'toBeReviewed', value: stats.toBeReviewed, suffixValue: stats.totalStudents },
        { title: 'passed', value: stats.passed, suffixValue: stats.submitted },
        { title: 'failed', value: stats.failed, suffixValue: stats.submitted },
        { title: 'passRate', value: (stats.passed / stats.totalStudents) * 100, suffixValue: '%' }
    ]

    return (
        <Grid columns="3" gap="3" rows="repeat(2, 64px)" width="auto">
            {displayStats.map((stat, index) => (
                <Statistic
                    key={index}
                    title={t(stat.title as LocaleKeys) as string}
                    value={stat.value}
                    suffix={`/ ${stat.suffixValue}`}
                />
            ))}
        </Grid>
    )
}
