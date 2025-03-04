import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
// import { Resource } from "sst";

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
});
