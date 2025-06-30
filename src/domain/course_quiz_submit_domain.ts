import { courseQuizSubmitDao } from '@/persist/db'
import {
    Class,
    CourseQuizSubmit,
    CourseQuizSubmitStatus,
    UserJoinClass
} from './types'
import { UserJoinClassDomain } from './user_join_class_domain'
import { getStatFromSubmitList } from './shared'

export interface CourseQuizStat {
    total: number
    submitted: number
    notSubmitted: number
    passed: number
    failed: number
    reviewed: number
    toBeReviewed: number
    submitRate: number
    passRate: number
    reviewRate: number
}

export class CourseQuizSubmitDomain {
    constructor() {}

    getQuizImgPastePath(
        userJoinClassId: string,
        courseQuizSubmitId: string
    ): string {
        return `user-join-class/${userJoinClassId}/${courseQuizSubmitId}/index.png`
    }

    async create(submit: CourseQuizSubmit): Promise<CourseQuizSubmit> {
        return await courseQuizSubmitDao.create(submit)
    }

    async update(
        id: string,
        status: CourseQuizSubmitStatus
    ): Promise<CourseQuizSubmit> {
        return await courseQuizSubmitDao.update(id, status)
    }

    async getSubmit(
        userJoinClassId: string,
        quizId: string
    ): Promise<CourseQuizSubmit | null> {
        return await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(
            userJoinClassId,
            quizId
        )
    }

    async submit(
        userJoinClass: UserJoinClass,
        quizId: string,
        answers: string[]
    ): Promise<CourseQuizSubmit> {
        // 这里要注意同一个quizId多次上传，重复创建CourseQuizSubmit的问题
        // 要先找到这个UserJoinClass对应的quizId的提交记录，如果有，则直接返回，否则创建新的提交记录
        const existed = await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(
            userJoinClass.id,
            quizId
        )
        if (existed) {
            return existed
        }

        // 创建新提交
        const submit: CourseQuizSubmit = {
            id: crypto.randomUUID(),
            userJoinClassId: userJoinClass.id, //gsi1
            quizId, //gsi2
            classId: userJoinClass.classId, //gsi3
            status: 'SUBMITTED'
        }
        return await courseQuizSubmitDao.create(submit)
    }

    async getByUserJoinClassAndQuiz(
        userJoinClassId: string,
        quizId: string
    ): Promise<CourseQuizSubmit | null> {
        return await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(
            userJoinClassId,
            quizId
        )
    }

    async getListByClassId(
        classId: string,
        quizId: string
    ): Promise<CourseQuizSubmit[]> {
        const submitList = await courseQuizSubmitDao.getListByClassId(classId)
        return submitList.filter((submit) => submit.quizId === quizId)
    }

    /**
     *
     * @param userJoinClassId
     * @returns 一个班级的某个用户在这门课程中所有的提交记录的总分
     *
     * 计分规则：
     * 1. 未提交的题目得0分
     * 2. 正确答案得2分
     * 3. 错误答案得1分
     */
    async getUserJoinClassTotalScore(userJoinClassId: string): Promise<number> {
        const userSubmitList =
            await courseQuizSubmitDao.getListByUserJoinClassId(userJoinClassId)
        const totalScore = userSubmitList.reduce(
            (acc, submit) =>
                acc +
                (submit.status === 'NOT_SUBMITTED'
                    ? 0
                    : submit.status === 'PASSED'
                    ? 2
                    : 1),
            0
        )
        return totalScore
    }

    async getQuizStatistics(
        klass: Class,
        quizId: string
    ): Promise<CourseQuizStat> {
        // 首先，获取当前班级的所有加入学生，以及当前班级这个quizId的所有提交记录
        const d1 = new UserJoinClassDomain()
        const joinedUserList = await d1.getListByClassId(klass.id)
        const submittedList = await this.getListByClassId(klass.id, quizId)
        // 然后，用一个循环遍历所有加入学生，生成一个新数组submitList，其中每个元素是对应学生的提交记录
        const submitList = []
        for (const userJoinClass of joinedUserList) {
            const submit = submittedList.find(
                (submit) => submit.userJoinClassId === userJoinClass.id
            )
            if (submit) {
                submitList.push(submit)
            } else {
                submitList.push({
                    id: '',
                    userJoinClassId: userJoinClass.id,
                    quizId: quizId,
                    classId: klass.id,
                    status: 'NOT_SUBMITTED' as const,
                    userJoinClass,
                    url: '/img/blank.png'
                })
            }
        }

        return getStatFromSubmitList(submitList)
    }
}
