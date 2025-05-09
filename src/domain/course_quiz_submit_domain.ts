import { courseQuizSubmitDao, userJoinClassDao } from '@/persist/db'
import { CourseQuizSubmit, CourseQuizSubmitStatus, UserJoinClass } from './types'
import { UserJoinClassDomain } from './user_join_class_domain'

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

    async getQuizStatistics(userJoinClass: UserJoinClass, quizId: string) {
        // 首先，获取当前班级的所有加入学生，以及当前班级的所有提交记录
        const d1 = new UserJoinClassDomain()
        const joinedUserList = await d1.getListByClassId(userJoinClass.classId)

        // 然后，用一个循环遍历所有加入学生，获取每个学生的提交记录
        const d2 = new CourseQuizSubmitDomain()
        const submitList = await Promise.all(
            joinedUserList.map(async (userJoinClass) => {
                const submit = await d2.getSubmit(userJoinClass.id, quizId)
                return submit
            })
        )
        // 最后，根据每个加入学生的提交记录的状态进行统计
        const totalStudents = joinedUserList.length
        const submitted = submitList.filter((submit) => submit != null).length
        const notSubmitted = totalStudents - submitted
        const passed = submitList.filter((submit) => submit != null && submit.status === 'PASSED').length
        const failed = submitList.filter((submit) => submit != null && submit.status === 'FAILED').length
        const toBeReviewed = submitList.filter((submit) => submit != null && submit.status === 'SUBMITTED').length

        const submitRate = submitted > 0 ? submitted / totalStudents : 0
        const passRate = submitted > 0 ? passed / submitted : 0
        return {
            totalStudents, // 班级总人数
            submitted, // 已提交人数
            notSubmitted, // 未提交人数
            passed, // 通过人数
            failed, // 未通过人数
            toBeReviewed, // 待批改人数
            submitRate, // 提交率
            passRate // 通过率
        }
    }
}
