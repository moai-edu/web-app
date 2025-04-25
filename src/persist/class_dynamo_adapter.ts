import { Class } from '@/domain/types'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import Dao from './dao'

export interface ClassDao {
    create(_class: Class): Promise<Class | null>
    getById(id: string): Promise<Class | null>
    getByCode(code: string): Promise<Class | null>
    update(id: string, name: string): Promise<Class>
    getListByUserId(userId: string): Promise<Class[]>
    delete(id: string): Promise<Class | null>
}

export function ClassDynamoAdapter(client: DynamoDBDocument, tableName: string): ClassDao {
    const dao = new Dao(client, tableName, 'CLASS')
    return {
        async create(_class: Class): Promise<Class> {
            await dao.createWithGSI12(_class, _class.userId, _class.code)
            return _class
        },
        async getById(id: string): Promise<Class | null> {
            return dao.getById<Class>(id)
        },
        async getByCode(code: string): Promise<Class | null> {
            return dao.getByGSI2<Class>(code)
        },
        async update(id: string, name: string): Promise<Class> {
            return dao.update<Class>(id, { name })
        },
        async getListByUserId(userId: string): Promise<Class[]> {
            return dao.getListByGSI1<Class>(userId)
        },
        async delete(id: string): Promise<Class | null> {
            return dao.delete<Class>(id)
        }
    }
}
