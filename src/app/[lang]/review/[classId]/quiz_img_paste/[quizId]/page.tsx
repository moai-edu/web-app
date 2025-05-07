'use client'

import { use } from 'react'
import { I18nLangKeys } from '@/i18n'
import React from 'react'
import { EditOutlined, EllipsisOutlined, SettingOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { Avatar, Card, Image, Space, Upload } from 'antd'
import { CheckIcon, Cross1Icon, UploadIcon } from '@radix-ui/react-icons'
const { Meta } = Card

type PageProps = Readonly<{
    params: Promise<{
        lang: I18nLangKeys
        classId: string
        quizId: string
    }>
}>

export default function Page({ params }: PageProps) {
    const { lang, classId, quizId } = use(params)
    const [current, setCurrent] = React.useState(0)

    return (
        <div>
            <h1>
                班级：{classId} 题号：{quizId}{' '}
            </h1>
            <Image.PreviewGroup
                preview={{
                    toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn } }) => (
                        <Space size={12} className="toolbar-wrapper">
                            {current}
                            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                        </Space>
                    ),
                    onChange: (current, prev) => {
                        setCurrent(current)
                        console.log(`current index: ${current}, prev index: ${prev}`)
                    }
                }}
            >
                <div className="flex flex-wrap justify-center">
                    {Array.from({ length: 16 }, (_, i) => (
                        <div key={i} className="px-2 py-2">
                            <Card
                                title={'张三'}
                                hoverable
                                style={{ width: 140, paddingLeft: 1, paddingRight: 1 }}
                                cover={
                                    <Image
                                        alt=""
                                        src="https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp"
                                        onClick={() => setCurrent(i)}
                                    />
                                }
                                actions={[
                                    <UploadIcon key="submitted" />,
                                    <CheckIcon key="passed" />,
                                    <Cross1Icon key="failed" />
                                ]}
                            >
                                <Meta avatar={<UploadIcon />} description="已提交" />
                            </Card>
                        </div>
                    ))}
                </div>
            </Image.PreviewGroup>
        </div>
    )
}
