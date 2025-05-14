import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { Class, UserJoinClass } from '@/domain/types'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys, LocaleKeys } from '@/i18n'
import { Grid, Link } from '@radix-ui/themes'
import { Statistic } from 'antd'

interface Props {
    lang: I18nLangKeys
    klass: Class
    quizId: string
}

export default async function PasteImgStat({ lang, klass, quizId }: Props) {
    const { t } = await useServerLocale(lang)

    const domain = new CourseQuizSubmitDomain()
    const stats = await domain.getQuizStatistics(klass, quizId)

    const displayStats = [
        { title: 'submitted', value: stats.submitted, suffixValue: `/ ${stats.totalStudents}` },
        { title: 'notSubmitted', value: stats.notSubmitted, suffixValue: `/ ${stats.totalStudents}` },
        { title: 'submitRate', value: (stats.submitRate * 100).toFixed(2), suffixValue: '%' },
        { title: 'passed', value: stats.passed, suffixValue: `/ ${stats.submitted}` },
        { title: 'failed', value: stats.failed, suffixValue: `/ ${stats.submitted}` },
        { title: 'passRate', value: (stats.passRate * 100).toFixed(2), suffixValue: '%' },
        { title: 'toBeReviewed', value: stats.toBeReviewed, suffixValue: `/ ${stats.submitted}` }
    ]

    return (
        <Link href={`/review/${klass.id}/quiz_img_paste/${quizId}`} target="_blank">
            <Grid columns="3" gap="3" rows="repeat(2, 64px)" width="auto">
                {displayStats.map((stat, index) => (
                    <Statistic
                        key={index}
                        title={t(stat.title as LocaleKeys) as string}
                        value={stat.value}
                        suffix={stat.suffixValue}
                    />
                ))}
            </Grid>
        </Link>
    )
}
