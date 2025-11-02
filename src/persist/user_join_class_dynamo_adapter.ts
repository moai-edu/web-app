import { UserJoinClass } from '@/domain/types'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import Dao from './dao'

export interface UserJoinClassDao {
    create(_UserJoinClass: UserJoinClass): Promise<UserJoinClass>
    getById(id: string): Promise<UserJoinClass | null>
    getListByUserId(userId: string): Promise<UserJoinClass[]>
    getListByClassId(classId: string): Promise<UserJoinClass[]>
    delete(id: string): Promise<UserJoinClass | null>
}

export function UserJoinClassDynamoAdapter(client: DynamoDBDocument, tableName: string): UserJoinClassDao {
    const dao = new Dao(client, tableName, 'USER_JOIN_CLASS')
    return {
        async create(model: UserJoinClass): Promise<UserJoinClass> {
            await dao.createWithGSI12(model, model.userId, model.classId)
            return model
        },
        async getById(id: string): Promise<UserJoinClass | null> {
            return dao.getById<UserJoinClass>(id)
        },
        async getListByUserId(userId: string): Promise<UserJoinClass[]> {
            return dao.getListByGSI1<UserJoinClass>(userId)
        },
        async getListByClassId(classId: string): Promise<UserJoinClass[]> {
            return dao.getListByGSI2<UserJoinClass>(classId)
        },
        async delete(id: string): Promise<UserJoinClass | null> {
            return dao.delete<UserJoinClass>(id)
        }
    }
}
