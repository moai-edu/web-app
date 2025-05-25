import { s3DataClient } from '@/persist/s3'
import S3DataClient from '@/persist/s3_data_client'
import { base } from '@faker-js/faker'
import * as cheerio from 'cheerio'

export interface StaticHtmlResource {
    headHtml: string
    bodyHtml: string
}

export class StaticResourceDomain {
    s3DataClient: S3DataClient
    // Normal signature with defaults
    constructor() {
        this.s3DataClient = s3DataClient
    }

    async getStaticHtmlResource(slug: string, path: string): Promise<StaticHtmlResource | null> {
        let resourcePath = ['static', slug, path].join('/')
        if (!resourcePath.endsWith('.html')) {
            resourcePath = `${resourcePath}.html`
        }
        // 从包含文件名的完整路径中提取出文件所在的基路径。通过使用正则表达式和 replace 方法，它能够有效地去除路径中的文件名部分，只保留文件所在的目录路径。
        const basePath = resourcePath.replace(/\/[^/]+$/, '')
        console.log('Fetching static resource:', resourcePath, basePath)

        // 返回html页面代码，将所有引用资源 URL 转换为 S3 signed url
        try {
            // 1. 获取原始HTML内容
            const htmlContent = await this.s3DataClient.getTextContent(resourcePath)
            // 2. 处理HTML中的资源引用

            const $ = cheerio.load(htmlContent)
            const resourceElements = this.collectResourceElements($)

            // 批量生成签名URL
            await this.replaceResourceUrls($, resourceElements, basePath)

            // 提取head部分的HTML
            const headHtml = $('head').html() || ''
            // 提取body部分的HTML
            const bodyHtml = $('body').html() || ''
            return { headHtml, bodyHtml }
        } catch (error) {
            console.error('Failed to load static resource:', error)
            return null
        }
    }

    private collectResourceElements($: cheerio.CheerioAPI) {
        const elements: Array<{
            element: any
            attr: string
            originalUrl: string
        }> = []

        // 收集所有需要处理的资源元素
        $('[src],[href],[data-src]').each((_, element) => {
            const attributes = ['src', 'href', 'data-src']
            attributes.forEach((attr) => {
                const value = $(element).attr(attr)
                if (value && !this.isExternalUrl(value)) {
                    elements.push({ element: element, attr, originalUrl: value })
                }
            })
        })

        return elements
    }

    private async replaceResourceUrls(
        $: cheerio.CheerioAPI,
        elements: Array<{
            element: any
            attr: string
            originalUrl: string
        }>,
        basePath: string
    ) {
        // 并行处理所有资源URL
        await Promise.all(
            elements.map(async ({ element, attr, originalUrl }) => {
                const resourceKey = `${basePath}/${originalUrl.replace(/^\//, '')}`
                try {
                    const signedUrl = await this.s3DataClient.getSignedUrl(resourceKey)
                    $(element).attr(attr, signedUrl)
                } catch (error) {
                    console.error(`Failed to sign URL for ${resourceKey}:`, error)
                    // 保留原始URL如果签名失败
                }
            })
        )
    }

    private isExternalUrl(url: string): boolean {
        return /^(https?:)?\/\//i.test(url)
    }
}
