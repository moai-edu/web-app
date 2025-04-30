import { CourseQuizSubmit } from '@/domain/types'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import Dao from './dao'

export interface CourseQuizSubmitDao {
    create(model: CourseQuizSubmit): Promise<CourseQuizSubmit>
    getById(id: string): Promise<CourseQuizSubmit | null>
    getByUserJoinClassIdAndQuizId(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null>
}

export function CourseQuizSubmitDynamoAdapter(client: DynamoDBDocument, tableName: string): CourseQuizSubmitDao {
    const dao = new Dao(client, tableName, 'COURSE_QUIZ_SUBMIT')
    return {
        async create(model: CourseQuizSubmit): Promise<CourseQuizSubmit> {
            await dao.createWithGSI12(model, model.userJoinClassId, model.quizId)
            return model
        },
        async getById(id: string): Promise<CourseQuizSubmit | null> {
            return dao.getById<CourseQuizSubmit>(id)
        },
        async getByUserJoinClassIdAndQuizId(userJoinClassId: string, quizId: string): Promise<CourseQuizSubmit | null> {
            const all_user_quiz_submits = await dao.getListByGSI1<CourseQuizSubmit>(userJoinClassId)
            return all_user_quiz_submits.find((submit) => submit.quizId === quizId) || null
        }
    }
}
