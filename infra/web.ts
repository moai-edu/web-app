/// <reference path="../.sst/platform/config.d.ts" />

import { table } from "console";
import { authUrl, portalDomain, userPool, webClient } from "./auth";
import { secret } from "./secret";

const webConfig = {
    // link: [userPool, webClient, table],
    domain: portalDomain,
    environment: {
        AUTH_SECRET: secret.nextAuthSecret.value, //next-auth 使用这个环境变量设置secret: https://authjs.dev/reference/core/errors#missingsecret
        NEXT_PUBLIC_REGION: aws.getRegionOutput().name,
        NEXT_PUBLIC_USER_POOL_DOMAIN: authUrl,
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_WEB_CLIENT_ID: webClient.id,
        COGNITO_WEB_CLIENT_SECRET: webClient.secret,
    },
};

export const web = new sst.aws.Nextjs("Web", webConfig);
