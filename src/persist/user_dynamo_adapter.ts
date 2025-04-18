import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { User } from 'next-auth'
import Dao from './dao'

export function UserDynamoAdapter(client: DynamoDBDocument, tableName: string) {
    const dao = new Dao(client, tableName, 'USER')

    return {
        async create(user: User): Promise<User> {
            await dao.createWithGSI1(user, user.email!)
            return user
        },

        async getById(id: string): Promise<User | null> {
            return dao.getById<User>(id)
        },

        async getByEmail(email: string): Promise<User | null> {
            return dao.getByGSI1<User>(email)
        },

        async getBySlug(slug: string): Promise<User | null> {
            return dao.getByGSI2<User>(slug)
        },

        async update(id: string, name: string, slug: string): Promise<User> {
            return dao.updateWithGSI2(id, { name, slug }, slug)
        },

        async delete(id: string) {
            return dao.delete<User>(id)
        }
    }
}
