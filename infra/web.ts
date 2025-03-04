/// <reference path="../.sst/platform/config.d.ts" />

import { table } from "console";
import { authUrl, portalDomain, userPool, webClient } from "./auth";

const webConfig = {
    link: [userPool, webClient, table],
    domain: portalDomain,
    environment: {
        NEXT_PUBLIC_REGION: aws.getRegionOutput().name,
        NEXT_PUBLIC_USER_POOL_DOMAIN: authUrl,
    },
};

export const web = new sst.aws.Nextjs("Web", webConfig);
