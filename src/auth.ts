import NextAuth from 'next-auth'
import Cognito from 'next-auth/providers/cognito'
import { Resource } from 'sst'
import { DynamoDBAdapter } from '@auth/dynamodb-adapter'
import { NextResponse } from 'next/server'
import { AUTH_TABLE_NAME, bizAdapter, dynamoClient } from './persist/db'
import { BizUser } from './app/domain/types'
import { NextAuthResult } from 'next-auth'
import { Adapter } from 'next-auth/adapters'

const PROVIDER = 'cognito'

const cognitoOptions =
    process.env.NODE_ENV === 'development'
        ? {
              clientId: process.env.COGNITO_WEB_CLIENT_ID,
              clientSecret: process.env.COGNITO_WEB_CLIENT_SECRET,
              issuer:
                  'https://cognito-idp.' +
                  process.env.NEXT_PUBLIC_REGION +
                  '.amazonaws.com/' +
                  process.env.COGNITO_USER_POOL_ID
          }
        : {
              clientId: Resource.WebClient.id,
              clientSecret: Resource.WebClient.secret,
              issuer:
                  'https://cognito-idp.' +
                  process.env.NEXT_PUBLIC_REGION +
                  '.amazonaws.com/' +
                  Resource.UserPool.id
          }

const result: NextAuthResult = NextAuth({
    // read here https://authjs.dev/getting-started/deployment#auth_trust_host
    trustHost: true,
    theme: { logo: 'https://next-auth.js.org/img/logo/logo-sm.png' },
    providers: [Cognito(cognitoOptions)],
    callbacks: {
        signIn({ account, profile }) {
            if (account!.provider === PROVIDER) {
                return profile!.email_verified! // 仅允许已验证邮箱用户登录
            }
            return false
        },
        authorized({ request, auth }) {
            try {
                const { pathname } = request.nextUrl
                console.log(pathname)
                if (pathname.startsWith('/protected-page')) return !!auth
                return true
            } catch (err) {
                console.log(err)
            }
        },
        jwt({ token, trigger, session }) {
            if (trigger === 'update') token.name = session.user.email
            return token
        },
        async session({ session, user }) {
            // 这个函数在进入每个页面都会执行，
            // 所以，可以把BizUser的信息放到session里面，供每个页面使用。

            // create user in bizdata db for new user
            let bizUser: BizUser | null = await bizAdapter.getBizUserById(
                user.id
            )
            if (!bizUser) {
                const name = user.email.split('@')[0]
                bizUser = await bizAdapter.createBizUser({
                    id: user.id,
                    email: user.email,
                    name: name,
                    slug: ''
                })
                console.log(`create new user in biz data db: ${bizUser}`)
            }
            session.user.name = bizUser.name
            session.user.slug = bizUser.slug
            return session
        }
    },
    session: {
        // force to db
        strategy: 'database',
        // Seconds - How long until an idle session expires and is no longer valid.
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    adapter: DynamoDBAdapter(dynamoClient, {
        tableName: AUTH_TABLE_NAME
    }) as unknown as Adapter
})

export const { handlers, signOut, auth } = result
export async function signIn() {
    await result.signIn(PROVIDER)
}

// 这个路由中间件暂时不使用，因为部署在Lambda@Edge上。
// Lambda@Edge 不支持环境变量、文件系统等，无法读取配置文件，而且访问DynamoDB时不方便，成本也比较高。
export async function middleware(req: Request) {
    const url = new URL(req.url)

    if (url.pathname.startsWith('/api/protected')) {
        // API 路径处理：返回 401 未授权响应
        const session = await auth()
        if (!session) {
            return NextResponse.json(
                { message: 'Middleware: Unauthorized access. Please log in.' },
                { status: 401 }
            )
        }
        return NextResponse.next()
    }

    if (url.pathname.startsWith('/protected')) {
        // Page 路径处理：重定向到登录页面
        const session = await auth()
        if (!session) {
            const loginUrl = new URL(
                `/api/auth/signin?callbackUrl=${req.url}`,
                req.url
            )

            return NextResponse.redirect(loginUrl.toString())
        }
        return NextResponse.next()
    }

    // 如果请求不匹配任何规则，则继续处理
    return NextResponse.next()
}
