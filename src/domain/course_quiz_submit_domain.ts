import { courseQuizSubmitDao } from '@/persist/db'
import { CourseQuizSubmit, UserJoinClass } from './types'
import { User } from 'next-auth'
import { BoxModelIcon } from '@radix-ui/react-icons'

export class CourseQuizSubmitDomain {
    constructor() {}

    async submit(model: UserJoinClass, quizId: string): Promise<CourseQuizSubmit> {
        // 这里要注意同一个quizId多次上传，重复创建CourseQuizSubmit的问题
        // 要先找到这个UserJoinClass对应的quizId的提交记录，如果有，则直接返回，否则创建新的提交记录
        const existed = await courseQuizSubmitDao.getByUserJoinClassIdAndQuizId(model.id, quizId)
        if (existed) {
            return existed
        }

        // 创建新提交
        const submit: CourseQuizSubmit = {
            id: crypto.randomUUID(),
            userJoinClassId: model.id,
            quizId,
            status: 'SUBMITTED'
        }
        return await courseQuizSubmitDao.create(submit)
    }
}
