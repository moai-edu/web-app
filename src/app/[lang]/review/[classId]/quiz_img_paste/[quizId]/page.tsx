export const dynamic = 'force-dynamic'

import { I18nLangKeys } from '@/i18n'
import React from 'react'
import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { s3DataClient } from '@/persist/s3'
import ImagePreviewGroup from './image_preview_group'
import { ClassDomain } from '@/domain/class_domain'

type PageProps = Readonly<{
    params: Promise<{
        lang: I18nLangKeys
        classId: string
        quizId: string
    }>
}>

export default async function Page({ params }: PageProps) {
    const { lang, classId, quizId } = await params

    const d0 = new ClassDomain()
    const classInfo = await d0.getById(classId)

    const d1 = new UserJoinClassDomain()
    const userJoinClassList = await d1.getListByClassId(classId)

    const results = []
    for (const userJoinClass of userJoinClassList) {
        const d2 = new CourseQuizSubmitDomain()
        const submit = await d2.getByUserJoinClassAndQuiz(userJoinClass.id, quizId)
        if (submit) {
            submit.userJoinClass = userJoinClass
            const path = d2.getQuizImgPastePath(userJoinClass.id, submit.id)
            if (await s3DataClient.isFileExists(path)) {
                submit.url = await s3DataClient.getSignedUrl(path)
            } else {
                submit.url = '/img/placeholder.svg'
            }
            results.push(submit)
        } else {
            results.push({
                id: '',
                userJoinClassId: userJoinClass.id,
                quizId: quizId,
                classId: classId,
                status: 'NOT_SUBMITTED' as const,
                userJoinClass: userJoinClass,
                url: '/img/todo.png'
            })
        }
    }

    return (
        <div>
            <h1>
                班级：{classInfo?.name} 题号：{quizId}
            </h1>
            <ImagePreviewGroup submissions={results} />
        </div>
    )
}
