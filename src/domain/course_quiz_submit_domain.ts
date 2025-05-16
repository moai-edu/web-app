import { courseQuizSubmitDao } from '@/persist/db'
import { Class, CourseQuizSubmit, CourseQuizSubmitStatus, UserJoinClass } from './types'
import { UserJoinClassDomain } from './user_join_class_domain'

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

    getQuizImgPastePath(userJoinClassId: string, courseQuizSubmitId: string): string {
        return `user-join-class/${userJoinClassId}/${courseQuizSubmitId}/index.png`
    }

    async create(submit: CourseQuizSubmit): Promise<CourseQuizSubmit> {
        return await courseQuizSubmitDao.create(submit)
    }

    async update(id: string, status: CourseQuizSubmitStatus): Promise<CourseQuizSubmit> {
        return await courseQuizSubmitDao.update(id, status)
    }

    async getSubmit(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null> {
        return await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(userJoinClassId, quizId)
    }

    async submit(userJoinClass: UserJoinClass, quizId: string, answers: string[]): Promise<CourseQuizSubmit> {
        // 这里要注意同一个quizId多次上传，重复创建CourseQuizSubmit的问题
        // 要先找到这个UserJoinClass对应的quizId的提交记录，如果有，则直接返回，否则创建新的提交记录
        const existed = await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(userJoinClass.id, quizId)
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

    async getByUserJoinClassAndQuiz(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null> {
        return await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(userJoinClassId, quizId)
    }

    async getListByClassId(classId: string, quizId: string): Promise<CourseQuizSubmit[]> {
        const submitList = await courseQuizSubmitDao.getListByClassId(classId)
        return submitList.filter((submit) => submit.quizId === quizId)
    }

    async getQuizStatistics(klass: Class, quizId: string): Promise<CourseQuizStat> {
        // 首先，获取当前班级的所有加入学生，以及当前班级这个quizId的所有提交记录
        const d1 = new UserJoinClassDomain()
        const joinedUserList = await d1.getListByClassId(klass.id)
        const submittedList = await this.getListByClassId(klass.id, quizId)
        // 然后，用一个循环遍历所有加入学生，生成一个新数组submitList，其中每个元素是对应学生的提交记录
        const submitList = []
        for (const userJoinClass of joinedUserList) {
            const submit = submittedList.find((submit) => submit.userJoinClassId === userJoinClass.id)
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

        return this.getStat(submitList)
    }
    getStat(submitList: CourseQuizSubmit[]): CourseQuizStat {
        // 最后，根据每个加入学生的提交记录的状态进行统计
        const total = submitList.length
        const submitted = submitList.filter((submit) => submit.status != 'NOT_SUBMITTED').length
        const notSubmitted = total - submitted
        const passed = submitList.filter((submit) => submit.status === 'PASSED').length
        const failed = submitList.filter((submit) => submit.status === 'FAILED').length
        const reviewed = passed + failed
        const toBeReviewed = submitted - reviewed

        const submitRate = submitted > 0 ? submitted / total : 0
        const passRate = submitted > 0 ? passed / submitted : 0
        const reviewRate = submitted > 0 ? reviewed / submitted : 0
        return {
            total, // 总人数
            submitted, // 已提交人数
            notSubmitted, // 未提交人数
            passed, // 通过人数
            failed, // 未通过人数
            reviewed, // 已批改人数
            toBeReviewed, // 待批改人数
            submitRate, // 提交率
            passRate, // 通过率
            reviewRate // 批改率
        }
    }
}
