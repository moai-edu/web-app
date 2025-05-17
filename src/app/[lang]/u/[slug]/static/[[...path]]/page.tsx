export const dynamic = 'force-dynamic'

import { StaticResourceDomain } from '@/domain/static_resource_domain'
import { notFound } from 'next/navigation'

type PageProps = Readonly<{
    params: Promise<{ slug: string; path?: string[] }>
}>

export default async function Page({ params }: PageProps) {
    const { slug, path = [] } = await params // 默认空数组
    const resourcePath = ['static', slug, ...path].join('/')
    const htmlFilePath = `${resourcePath}.html` // 自动添加.html后缀
    console.log('htmlFilePath', htmlFilePath)

    const domain = new StaticResourceDomain()
    const html = await domain.getStaticResource(htmlFilePath)
    if (!html) return notFound()

    const dataUrl = `data:text/html;charset=utf-8;base64,${Buffer.from(html, 'utf-8').toString('base64')}`

    return (
        <div className="h-screen w-screen">
            <iframe
                src={dataUrl}
                sandbox="allow-same-origin allow-scripts allow-popups"
                className="w-full h-full border-0"
                allow="fullscreen"
            />
        </div>
    )
}
