/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'MoaiEdu-WebApp',
            home: 'aws',
            removal: input?.stage === 'prod' ? 'retain' : 'remove'
            // removal: 'remove'
        }
    },
    async run() {
        const infra = await import('./infra')
        return {
            webUrl: infra.web.url,
            dataBucketName: infra.dataBucket.name,
            dbDynamoName: infra.dbDynamo.name,
            cognitoUserPoolClientId: infra.webClient.id,
            authUrl: infra.authUrl
        }
        // 注意：这里一定记得同步更新sst-end.d.ts文件，否则编译可能失败。
    }
})
