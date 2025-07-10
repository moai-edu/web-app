/// <reference path="./.sst/platform/config.d.ts" />

// 必须在环境变量中指定sst部署到哪个AZ
const region: string = process.env.SST_AWS_REGION!
console.log(`SST_AWS_REGION: ${region}`)

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
            cognitoUserPoolClientId: infra.webClient.id,
            authUrl: infra.authUrl,
            webUrl: infra.web.url,
            dataBucketName: infra.dataBucket.name,
            dbDynamoName: infra.dbDynamo.name
        }
        // 注意：这里一定记得同步更新sst-end.d.ts文件，否则编译可能失败。
    }
})
