// https://github.com/honeinc/is-iso-date/blob/master/index.js
const isoDateRE =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

/** Determines if a given value can be parsed into `Date` */
export function isDate(value: unknown): value is string {
    return typeof value === 'string' && isoDateRE.test(value) && !isNaN(Date.parse(value))
}

const RECORD_PREFIX = ['USER', 'COURSE', 'CLASS']

export const DaoFormat = {
    /** Takes a plain old JavaScript object and turns it into a DynamoDB object */
    to(object: Record<string, unknown>) {
        const newObject: Record<string, unknown> = {}
        for (const key in object) {
            const value = object[key]
            if (value instanceof Date) {
                // DynamoDB requires the TTL attribute be a UNIX timestamp (in secs).
                if (key === 'expires') newObject[key] = value.getTime() / 1000
                else newObject[key] = value.toISOString()
            } else newObject[key] = value
        }
        return newObject
    },
    /** Takes a Dynamo object and returns a plain old JavaScript object */
    from<T = Record<string, unknown>>(object?: Record<string, unknown>): T | null {
        if (!object) return null
        const newObject: Record<string, unknown> = {}
        for (const key in object) {
            // Filter DynamoDB specific attributes so it doesn't get passed to core,
            // to avoid revealing the type of database
            if (['pk', 'sk', 'GSI1PK', 'GSI1SK'].includes(key)) continue

            const value = object[key]

            if (isDate(value)) newObject[key] = new Date(value)
            // hack to keep type property in account
            else if (key === 'type' && RECORD_PREFIX.includes(value as string)) continue
            // The expires property is stored as a UNIX timestamp in seconds, but
            // JavaScript needs it in milliseconds, so multiply by 1000.
            else if (key === 'expires' && typeof value === 'number') newObject[key] = new Date(value * 1000)
            else newObject[key] = value
        }
        return newObject as T
    }
}

export function generateUpdateExpression(object: Record<string, unknown>): {
    UpdateExpression: string
    ExpressionAttributeNames: Record<string, string>
    ExpressionAttributeValues: Record<string, unknown>
} {
    const formattedSession = DaoFormat.to(object)
    let UpdateExpression = 'set'
    const ExpressionAttributeNames: Record<string, string> = {}
    const ExpressionAttributeValues: Record<string, unknown> = {}
    for (const property in formattedSession) {
        UpdateExpression += ` #${property} = :${property},`
        ExpressionAttributeNames['#' + property] = property
        ExpressionAttributeValues[':' + property] = formattedSession[property]
    }
    UpdateExpression = UpdateExpression.slice(0, -1)
    return {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
    }
}
