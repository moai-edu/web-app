/// <reference path="../.sst/platform/config.d.ts" />

// not yet used
const stage_domain =
    $app.stage === 'prod'
        ? {
              //在prod环境下，创建apex domain，并将静态网站的subdomain重定向到apex domain
              name: process.env.DOMAIN,
              redirects: [`${process.env.STATIC_SUBDOMAIN}.${process.env.DOMAIN}`]
          }
        : `${$app.stage}-${process.env.STATIC_SUBDOMAIN}.${process.env.DOMAIN}`

const static_site_config = {
    domain: stage_domain,
    errorPage: '404.html',
    // This directory will be uploaded to S3. The path is relative to your sst.config.ts.
    path: '_site'
}

export const static_site = new sst.aws.StaticSite('StaticSite', static_site_config)
