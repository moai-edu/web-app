import { Class } from '@/domain/types'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import Dao from './dao'

export interface ClassDao {
    create(_class: Class): Promise<Class | null>
    getById(id: string): Promise<Class | null>
}

export function ClassDynamoAdapter(client: DynamoDBDocument, tableName: string) {
    const dao = new Dao(client, tableName, 'CLASS')
    return {
        async create(_class: Class): Promise<Class> {
            await dao.createWithGSI1(_class, _class.userId)
            return _class
        },
        async getById(id: string): Promise<Class | null> {
            return dao.getById<Class>(id)
        },
        async update(id: string, name: string): Promise<Class> {
            return dao.update<Class>(id, { name })
        },
        async getListByUserId(userId: string): Promise<Class[]> {
            return dao.getListByGSI1<Class>(userId)
        },
        async delete(id: string) {
            return dao.delete<Class>(id)
        }
    }
}
