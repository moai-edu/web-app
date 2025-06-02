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
            staticSiteS3BucketName: infra.static_site.nodes.assets!.name,
            staticSiteCloudfrontDistributionId: infra.static_site.nodes.cdn!.nodes.distribution.id
        }
    }
})
