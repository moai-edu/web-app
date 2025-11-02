// 注意：这是客户端与服务器端共享的代码

import { CourseQuizStat } from './course_quiz_submit_domain'
import { CourseQuizSubmit } from './types'

export function getStatFromSubmitList(submitList: CourseQuizSubmit[]): CourseQuizStat {
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
