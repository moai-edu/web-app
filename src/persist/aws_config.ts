/**
 * AWS 客户端配置的统一来源。
 *
 * 代码只读环境变量，不再按 NODE_ENV 判断「连云端还是连 LocalStack」，
 * 具体连到哪里完全由代码之外的环境变量决定：
 *
 * - 连 LocalStack：在 .env.local（测试用 .env.test）里设置
 *     AWS_ENDPOINT_URL=http://localhost.localstack.cloud:4566
 *     AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION
 * - 连真实 AWS：不设置 AWS_ENDPOINT_URL，凭证交给 SDK 默认凭证链
 *     （环境变量 → ~/.aws/credentials → Lambda/ECS 的 IAM Role）
 */
export function awsClientConfig() {
    // 未设置时为 undefined，SDK 会使用对应服务的官方地址
    const endpoint = process.env.AWS_ENDPOINT_URL

    return {
        endpoint,
        region: process.env.AWS_REGION,
        // 使用自定义 endpoint（LocalStack、MinIO 等）时走 path style 访问
        forcePathStyle: Boolean(endpoint)
    }
}
