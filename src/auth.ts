import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
// import { Resource } from "sst";

import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";

let conf: DynamoDBClientConfig = {};

if (process.env.NODE_ENV === "development") {
    conf = {
        endpoint: process.env.AWS_ENDPOINT_URL, // LocalStack 的地址
        region: process.env.AWS_REGION, // 区域
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!, // 访问密钥
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // 秘密密钥
        },
    };
} else {
    conf = {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.AWS_REGION,
    };
}

const client = DynamoDBDocument.from(new DynamoDB(conf), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    // read here https://authjs.dev/getting-started/deployment#auth_trust_host
    trustHost: true,
    theme: { logo: "https://next-auth.js.org/img/logo/logo-sm.png" },
    providers: [
        Cognito({
            // clientId: Resource.WebClient.id,
            // clientSecret: Resource.WebClient.secret,
            clientId: process.env.COGNITO_WEB_CLIENT_ID,
            clientSecret: process.env.COGNITO_WEB_CLIENT_SECRET,
            issuer:
                "https://cognito-idp." +
                process.env.NEXT_PUBLIC_REGION +
                ".amazonaws.com/" +
                process.env.COGNITO_USER_POOL_ID, // Resource.UserPool.id,
        }),
    ],
    callbacks: {
        authorized({ request, auth }) {
            try {
                const { pathname } = request.nextUrl;
                console.log(pathname);
                if (pathname.startsWith("/protected-page")) return !!auth;
                return true;
            } catch (err) {
                console.log(err);
            }
        },
        jwt({ token, trigger, session }) {
            if (trigger === "update") token.name = session.user.email;
            return token;
        },
    },
    adapter: DynamoDBAdapter(client, {
        tableName: process.env.AUTH_TABLE_NAME,
    }),
});
