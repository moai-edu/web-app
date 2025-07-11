import NextAuth from 'next-auth'
import Cognito from 'next-auth/providers/cognito'
import { Resource } from 'sst'
import { NextResponse } from 'next/server'
import { DB_TABLE_NAME, dynamoClient } from './persist/db'
import { NextAuthResult } from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import { DynamoDBAdapter } from '@auth/dynamodb-adapter'
import { redirect } from 'next/navigation'

const PROVIDER = 'cognito'

// 获取 Cognito 用户池和客户端 ID
// 确保这些变量在部署时能被正确获取
const COGNITO_USER_POOL_ID =
    process.env.COGNITO_USER_POOL_ID || Resource.UserPool.id
const COGNITO_WEB_CLIENT_ID =
    process.env.COGNITO_WEB_CLIENT_ID || Resource.WebClient.id
const COGNITO_WEB_CLIENT_SECRET =
    process.env.COGNITO_WEB_CLIENT_SECRET || Resource.WebClient.secret
const NEXT_PUBLIC_REGION = process.env.NEXT_PUBLIC_REGION || 'us-east-1' // 默认值，确保匹配你的实际区域

const COGNITO_LOGOUT_ENDPOINT =
    process.env.NODE_ENV === 'development'
        ? `https://dev-${process.env.AUTH_SUBDOMAIN}.${process.env.DOMAIN}/logout`
        : `https://${process.env.AUTH_DOMAIN}/logout`
const COGNITO_LOGOUT_REDIRECT_URI =
    process.env.NODE_ENV === 'development'
        ? `http://localhost:3000`
        : `https://${process.env.APP_DOMAIN}`

const cognitoOptions = {
    allowDangerousEmailAccountLinking: true, // 在生产环境中请谨慎使用此选项
    clientId: COGNITO_WEB_CLIENT_ID,
    clientSecret: COGNITO_WEB_CLIENT_SECRET,
    issuer: `https://cognito-idp.${NEXT_PUBLIC_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
    // *** 关键修改：增加 idToken 和 checks 配置 ***
    // `idToken: true` 确保 Next-Auth 在会话中包含 ID Token，这对于某些登出流程是必需的，但目前aws cognito logout不需要（不支持id_token_hint参数）
    idToken: true
    // `checks: ['pkce', 'state']` 增强安全性，通常是 OIDC/OAuth 的推荐做法
    // checks: ['pkce', 'state']
}

const result: NextAuthResult = NextAuth({
    // read here https://authjs.dev/getting-started/deployment#auth_trust_host
    trustHost: true,
    theme: { logo: 'https://next-auth.js.org/img/logo/logo-sm.png' },
    providers: [Cognito(cognitoOptions)],
    callbacks: {
        signIn({ account, profile }) {
            // console.log('signIn', account, profile)
            if (account!.provider === PROVIDER) {
                // console.log(profile!.email_verified)
                return profile!.email_verified! // 仅允许已验证邮箱用户登录
            }
            return false
        },
        authorized({ request, auth }) {
            // console.log('authorized', request, auth)
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
            // console.log('jwt', token, trigger, session)
            if (trigger === 'update') token.name = session.user.email
            return token
        },
        async session({ session }) {
            // console.log('session', session)
            // 这个函数在进入每个调用getSession或useSession时都会执行
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
        tableName: DB_TABLE_NAME
    }) as unknown as Adapter,
    debug: false
})

export const { handlers, auth } = result
export async function signIn() {
    await result.signIn(PROVIDER)
}

export async function signOut() {
    const session = await auth() // 获取当前会话信息

    if (session) {
        // 如果会话存在，执行本地登出
        await result.signOut({ redirect: false }) // 不重定向，直接清理会话
        console.log('Local session cleared.')
    }

    // 无论会话是否存在，我们都尝试执行 Cognito 的登出重定向
    // 因为即使本地会话已过期，Cognito 可能仍然有活跃会话
    // console.log('COGNITO_LOGOUT_ENDPOINT', COGNITO_LOGOUT_ENDPOINT)
    // console.log('COGNITO_LOGOUT_REDIRECT_URI', COGNITO_LOGOUT_REDIRECT_URI)

    const logoutUrl = new URL(COGNITO_LOGOUT_ENDPOINT)
    // redirect_uri: 用户在 Cognito 登出后被重定向到的应用程序 URL
    logoutUrl.searchParams.set('logout_uri', COGNITO_LOGOUT_REDIRECT_URI) // 登出后固定重定向到webapp的root
    // client_id: 你的 Cognito 用户池客户端 ID
    logoutUrl.searchParams.set('client_id', COGNITO_WEB_CLIENT_ID)

    // 重定向到 Cognito 的登出端点
    redirect(logoutUrl.toString())

    // 注意：由于我们已经重定向到 Cognito，Next-Auth 的本地 signOut() 不会在此时直接执行。
    // Cognito 重定向回来的 `logout_uri` 页面应该不包含会话信息，
    // Next-Auth 在那之后会发现没有有效的会话，从而完成本地的登出状态清理。
    // 所以这里不需要显示调用result.signOut()，因为后者会将用户重定向。
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
