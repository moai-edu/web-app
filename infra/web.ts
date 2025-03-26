/// <reference path="../.sst/platform/config.d.ts" />

import { table } from 'console'
import { portalDomain, userPool, webClient } from './auth'
import { secret } from './secret'
import { dataBucket } from './bucket'
import { dbDynamo } from './dynamodb'

const webConfig = {
    /**
     * 这行代码的作用是将一组 AWS 资源链接到 sst.aws.Nextjs 组件，使其可以：
     * 1. 自动注入环境变量：这些资源的信息（如 ID、ARN）会自动添加到 Next.js 的环境变量中，使得前端代码可以访问它们。
     * 2. 自动配置 IAM 权限：SST 会在 Lambda（如果 Next.js 需要 API 处理）和其他 AWS 服务之间自动添加适当的权限，使其可以安全访问这些资源，而不需要手动配置 IAM 角色。
     *
     */
    link: [userPool, webClient, dataBucket, dbDynamo, table],
    domain: portalDomain,
    environment: {
        // 这3个环境变量是保留的，所以这里不能设置，否则会报错；
        //lambda was unable to configure your environment variables because the environment variables you have provided contains reserved keys that are currently not supported for modification. reserved keys used in this request: aws_region, aws_access_key_id, aws_secret_access_key: provider=aws@6.66.2
        // AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
        // AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
        // AWS_REGION: process.env.AWS_REGION!,
        AUTH_SECRET: secret.nextAuthSecret.value, //next-auth 使用这个环境变量设置secret: https://authjs.dev/reference/core/errors#missingsecret
        NEXT_PUBLIC_REGION: aws.getRegionOutput().name
    }
}

export const web = new sst.aws.Nextjs('Web', webConfig)
