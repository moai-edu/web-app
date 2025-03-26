/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'portal-site',
            home: 'aws',
            removal: input?.stage === 'prod' ? 'retain' : 'remove'
        }
    },
    async run() {
        const infra = await import('./infra')
        return {
            webUrl: infra.web.url,
            dataBucketName: infra.dataBucket.name,
            dbDynamoName: infra.dbDynamo.name
            // clientId: infra.webClient.id,
            // authUrl: infra.authUrl,
            // static_site_url: infra.static_site.url,
            // static_site_s3_bucket_name: infra.static_site.nodes.assets?.name,
            // static_site_cloudfront_distribution_id:
            //     infra.static_site.nodes.cdn?.nodes.distribution.id,
        }
    }
})
