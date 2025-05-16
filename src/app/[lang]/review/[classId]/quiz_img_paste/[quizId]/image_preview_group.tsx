'use client'

import { ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons'
import { CircleIcon, CheckIcon, Cross1Icon, CircleBackslashIcon } from '@radix-ui/react-icons'
import { Space, Card, Image } from 'antd'
import Meta from 'antd/es/card/Meta'
import { CourseQuizSubmit, CourseQuizSubmitStatus } from '@/domain/types'
import { useLocale } from '@/hooks'
import { useState, useTransition, useMemo } from 'react'
import { createWithStatus, updateStatus } from './actions'
import { Badge, Button } from '@radix-ui/themes'
import PasteImgStat from '@/components/mdx/quiz_img_paste/paste_img_stat'
import { CourseQuizStat } from '@/domain/course_quiz_submit_domain'

interface Props {
    submissions: CourseQuizSubmit[]
}

export default function ImagePreviewGroup({ submissions }: Props) {
    const { t } = useLocale()
    const [list, setList] = useState<CourseQuizSubmit[]>(submissions)
    const [current, setCurrent] = useState(0)
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    // 使用 useMemo 计算 stat，当 list 变化时重新计算
    const stat = useMemo<CourseQuizStat>(() => {
        const total = list.length
        const submitted = list.filter((item) => item.status === 'SUBMITTED').length
        const passed = list.filter((item) => item.status === 'PASSED').length
        const failed = list.filter((item) => item.status === 'FAILED').length
        const notSubmitted = list.filter((item) => !item.status || item.status === 'NOT_SUBMITTED').length
        const reviewed = passed + failed
        const toBeReviewed = submitted

        // 计算比率，避免除以零的情况
        const submitRate = total > 0 ? (submitted + passed + failed) / total : 0
        const passRate = reviewed > 0 ? passed / reviewed : 0
        const reviewRate = submitted + passed + failed > 0 ? reviewed / (submitted + passed + failed) : 0

        return {
            total,
            submitted,
            notSubmitted,
            passed,
            failed,
            reviewed,
            toBeReviewed,
            submitRate,
            passRate,
            reviewRate
        }
    }, [list]) // 依赖于 list，当 list 变化时重新计算

    const submitAction = async (index: number, submit: CourseQuizSubmit, status: CourseQuizSubmitStatus) => {
        startTransition(async () => {
            if (submit.id === '') {
                const { success, data, error } = await createWithStatus(submit, status)
                if (success && data) {
                    const newList = [...list]
                    newList[index].id = data.id
                    newList[index].status = status
                    setList(newList)
                    console.log('create with status success')
                } else {
                    setError(error || 'failed')
                }
            } else {
                const { success, error } = await updateStatus(submit.id, status)
                if (success) {
                    const newList = [...list]
                    newList[index].status = status
                    setList(newList)
                } else {
                    setError(error || 'failed')
                }
            }
        })
    }

    function getStatusText(status: string) {
        switch (status) {
            case 'SUBMITTED':
                return (
                    <Badge variant="solid" color="indigo">
                        <CircleIcon />
                        {t('submitted')}
                    </Badge>
                )
            case 'PASSED':
                return (
                    <Badge variant="solid" color="green">
                        <CheckIcon />
                        {t('passed')}
                    </Badge>
                )
            case 'FAILED':
                return (
                    <Badge variant="solid" color="red">
                        <Cross1Icon />
                        {t('failed')}
                    </Badge>
                )
            default:
                return (
                    <Badge variant="solid" color="crimson">
                        <CircleBackslashIcon />
                        {t('notSubmitted')}
                    </Badge>
                )
        }
    }
    return (
        <>
            <Image.PreviewGroup
                preview={{
                    toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn } }) => (
                        <>
                            <Space size={12} className="toolbar-wrapper">
                                {list.length && (
                                    <>
                                        <Badge variant="solid" color="gray" highContrast>
                                            {list[current].userJoinClass!.user!.name}
                                        </Badge>
                                        {getStatusText(list[current].status)}
                                    </>
                                )}
                                <Button
                                    asChild
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={() => submitAction(current, list[current], 'SUBMITTED')}
                                >
                                    <CircleIcon />
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={() => submitAction(current, list[current], 'PASSED')}
                                >
                                    <CheckIcon />
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={() => submitAction(current, list[current], 'FAILED')}
                                >
                                    <Cross1Icon />
                                </Button>
                            </Space>
                            <Space size={12} className="toolbar-wrapper">
                                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                            </Space>
                        </>
                    ),
                    onChange: (current, prev) => {
                        setCurrent(current)
                        // console.log(`current index: ${current}, prev index: ${prev}`)
                    }
                }}
            >
                <div className="flex flex-wrap justify-center">
                    {list.map((item, idx) => (
                        <div key={idx} className="px-2 py-2">
                            <Card
                                title={item.userJoinClass!.user!.name}
                                hoverable
                                style={{ width: 120, paddingLeft: 1, paddingRight: 1 }}
                                cover={
                                    <Image
                                        alt=""
                                        src={item.url}
                                        onClick={() => setCurrent(idx)}
                                        style={{ height: 100 }}
                                    />
                                }
                                actions={[
                                    <Button
                                        asChild
                                        variant="ghost"
                                        disabled={isPending}
                                        onClick={() => submitAction(idx, item, 'SUBMITTED')}
                                    >
                                        <CircleIcon />
                                    </Button>,
                                    <Button
                                        asChild
                                        variant="ghost"
                                        disabled={isPending}
                                        onClick={() => submitAction(idx, item, 'PASSED')}
                                    >
                                        <CheckIcon />
                                    </Button>,
                                    <Button
                                        asChild
                                        variant="ghost"
                                        disabled={isPending}
                                        onClick={() => submitAction(idx, item, 'FAILED')}
                                    >
                                        <Cross1Icon />
                                    </Button>
                                ]}
                            >
                                <Meta description={getStatusText(item.status)} />
                            </Card>
                        </div>
                    ))}
                </div>
            </Image.PreviewGroup>
            <PasteImgStat stat={stat} />
        </>
    )
}
