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
            dbDynamoName: infra.dbDynamo.name,
            cognitoUserPoolClientId: infra.webClient.id,
            authUrl: infra.authUrl,
            staticSiteUrl: infra.static_site.url,
            staticSiteS3BucketName: infra.static_site.nodes.assets!.name
            // 这里这个cdn!返回null，所以无法取得distributionId，需要进一步研究
            // staticSiteCloudfrontDistributionId: infra.static_site.nodes.cdn!.nodes.distribution.id
        }
    }
})
