/// <reference path="../.sst/platform/config.d.ts" />

import { table } from "console";
import { authUrl, portalDomain, userPool, webClient } from "./auth";
import { secret } from "./secret";
import { dataBucket } from "./bucket";
import { nextAuthTable } from "./dynamodb";

const webConfig = {
    link: [userPool, webClient, dataBucket, table],
    domain: portalDomain,
    environment: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
        AWS_REGION: process.env.AWS_REGION!,
        AUTH_SECRET: secret.nextAuthSecret.value, //next-auth 使用这个环境变量设置secret: https://authjs.dev/reference/core/errors#missingsecret
        AUTH_TABLE_NAME: nextAuthTable.name,
        NEXT_PUBLIC_REGION: aws.getRegionOutput().name,
        NEXT_PUBLIC_USER_POOL_DOMAIN: authUrl,
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_WEB_CLIENT_ID: webClient.id,
        COGNITO_WEB_CLIENT_SECRET: webClient.secret,
        DATA_BUCKET_NAME: dataBucket.name,
    },
};

export const web = new sst.aws.Nextjs("Web", webConfig);
