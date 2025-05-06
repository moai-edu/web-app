import { courseQuizSubmitDao } from '@/persist/db'
import { CourseQuizSubmit } from './types'

export class CourseQuizSubmitDomain {
    constructor() {}

    getQuizImgPastePath(userJoinClassId: string, courseQuizSubmitId: string): string {
        return `user-join-class/${userJoinClassId}/${courseQuizSubmitId}/index.png`
    }

    async getSubmit(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null> {
        return await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(userJoinClassId, quizId)
    }

    async submit(userJoinClassId: string, quizId: string, answers: string[]): Promise<CourseQuizSubmit> {
        // 这里要注意同一个quizId多次上传，重复创建CourseQuizSubmit的问题
        // 要先找到这个UserJoinClass对应的quizId的提交记录，如果有，则直接返回，否则创建新的提交记录
        const existed = await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(userJoinClassId, quizId)
        if (existed) {
            return existed
        }

        // 创建新提交
        const submit: CourseQuizSubmit = {
            id: crypto.randomUUID(),
            userJoinClassId,
            quizId,
            status: 'SUBMITTED'
        }
        return await courseQuizSubmitDao.create(submit)
    }

    async getQuizStatistics(userJoinClassId: string, quizId: string) {
        // 实现实际的数据查询逻辑
        return {
            totalStudents: 100, // 班级总人数
            submitted: 93, // 已提交人数
            notSubmitted: 7, // 未提交人数
            toBeReviewed: 15, // 待批改人数
            passed: 78, // 通过人数
            failed: 15 // 未通过人数
        }
    }
}
