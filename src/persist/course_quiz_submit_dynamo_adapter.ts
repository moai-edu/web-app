import { CourseQuizSubmit, CourseQuizSubmitStatus } from '@/domain/types'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import Dao from './dao'

export interface CourseQuizSubmitDao {
    create(model: CourseQuizSubmit): Promise<CourseQuizSubmit>
    update(id: string, status: CourseQuizSubmitStatus): Promise<CourseQuizSubmit>
    getById(id: string): Promise<CourseQuizSubmit | null>
    getByUserJoinClassIdAndQuizId(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null>
    getListByClassId(classId: string): Promise<CourseQuizSubmit[]>
}

export function CourseQuizSubmitDynamoAdapter(client: DynamoDBDocument, tableName: string): CourseQuizSubmitDao {
    const dao = new Dao(client, tableName, 'COURSE_QUIZ_SUBMIT')
    return {
        async create(model: CourseQuizSubmit): Promise<CourseQuizSubmit> {
            await dao.createWithGSI123(model, model.userJoinClassId, model.quizId, model.classId)
            return model
        },
        async update(id: string, status: CourseQuizSubmitStatus): Promise<CourseQuizSubmit> {
            return dao.update<CourseQuizSubmit>(id, { status })
        },
        async getById(id: string): Promise<CourseQuizSubmit | null> {
            return dao.getById<CourseQuizSubmit>(id)
        },
        async getByUserJoinClassIdAndQuizId(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null> {
            //TODO: 这里查询可以优化吗？因为这里userJoinClassId和quizId都作为GSI1和GSI2，能不能一条查询就搞定？
            const all_user_quiz_submits = await dao.getListByGSI1<CourseQuizSubmit>(userJoinClassId)
            return all_user_quiz_submits.find((submit) => submit.quizId === quizId) || null
        },
        async getListByClassId(classId: string): Promise<CourseQuizSubmit[]> {
            return dao.getListByGSI3<CourseQuizSubmit>(classId)
        }
    }
}
