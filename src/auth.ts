import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { Resource } from "sst";

import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const authDbConf: DynamoDBClientConfig =
    process.env.NODE_ENV === "development"
        ? {
              endpoint: process.env.AWS_ENDPOINT_URL!, // LocalStack 的地址
              credentials: {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
              },
              region: process.env.AWS_REGION!,
          }
        : {
              credentials: fromNodeProviderChain(), // 这里会自动获取 IAM Role 的凭证
              region: process.env.AWS_REGION!,
          };

const authDbClient = DynamoDBDocument.from(new DynamoDB(authDbConf), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    },
});

console.log(`authDbConf=${JSON.stringify(authDbConf)}`);

const cognitoOptions =
    process.env.NODE_ENV === "development"
        ? {
              clientId: process.env.COGNITO_WEB_CLIENT_ID,
              clientSecret: process.env.COGNITO_WEB_CLIENT_SECRET,
              issuer:
                  "https://cognito-idp." +
                  process.env.NEXT_PUBLIC_REGION +
                  ".amazonaws.com/" +
                  process.env.COGNITO_USER_POOL_ID,
          }
        : {
              clientId: Resource.WebClient.id,
              clientSecret: Resource.WebClient.secret,
              issuer:
                  "https://cognito-idp." +
                  process.env.NEXT_PUBLIC_REGION +
                  ".amazonaws.com/" +
                  Resource.UserPool.id,
          };

const authDbTableName =
    process.env.NODE_ENV === "development"
        ? process.env.AUTH_TABLE_NAME
        : Resource.NextAuthDynamo.name;

export const { handlers, signIn, signOut, auth } = NextAuth({
    // read here https://authjs.dev/getting-started/deployment#auth_trust_host
    trustHost: true,
    theme: { logo: "https://next-auth.js.org/img/logo/logo-sm.png" },
    providers: [Cognito(cognitoOptions)],
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
        session({ session, user }) {
            session.user.name = user.email.split("@")[0];
            return session;
        },
    },
    session: {
        // force to db
        strategy: "database",
        // Seconds - How long until an idle session expires and is no longer valid.
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    adapter: DynamoDBAdapter(authDbClient, {
        tableName: authDbTableName,
    }),
});
