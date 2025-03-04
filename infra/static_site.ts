/// <reference path="../.sst/platform/config.d.ts" />

// not yet used
const stage_domain =
    $app.stage === "prod"
        ? `${process.env.DOMAIN}`
        : `${$app.stage}-${process.env.DOMAIN}`;

const static_site_config = {
    domain: stage_domain,
    errorPage: "404.html",
    // This directory will be uploaded to S3. The path is relative to your sst.config.ts.
    path: "_site",
};

export const static_site = new sst.aws.StaticSite(
    "DocsSite",
    static_site_config
);
