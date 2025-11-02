'use client'

import { CourseQuizStat } from '@/domain/course_quiz_submit_domain'
import { useLocale } from '@/hooks'
import { LocaleKeys } from '@/i18n'
import { Grid } from '@radix-ui/themes'
import { Statistic } from 'antd'

interface Props {
    stat: CourseQuizStat
}

export default function PasteImgStat({ stat }: Props) {
    const { t } = useLocale()

    const displayStats = [
        { title: 'submitted', value: stat.submitted, suffixValue: `/ ${stat.total}` },
        { title: 'notSubmitted', value: stat.notSubmitted, suffixValue: `/ ${stat.total}` },
        { title: 'submitRate', value: (stat.submitRate * 100).toFixed(0), suffixValue: '%' },
        { title: 'passed', value: stat.passed, suffixValue: `/ ${stat.submitted}` },
        { title: 'failed', value: stat.failed, suffixValue: `/ ${stat.submitted}` },
        { title: 'passRate', value: (stat.passRate * 100).toFixed(0), suffixValue: '%' },
        { title: 'reviewed', value: stat.reviewed, suffixValue: `/ ${stat.submitted}` },
        { title: 'toBeReviewed', value: stat.toBeReviewed, suffixValue: `/ ${stat.submitted}` },
        { title: 'reviewRate', value: (stat.reviewRate * 100).toFixed(0), suffixValue: '%' }
    ]

    return (
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
    )
}
