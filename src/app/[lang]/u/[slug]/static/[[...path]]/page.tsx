export const dynamic = 'force-dynamic'

import { StaticResourceDomain } from '@/domain/static_resource_domain'
import { notFound } from 'next/navigation'

type PageProps = Readonly<{
    params: Promise<{ slug: string; path?: string[] }>
}>

export default async function Page({ params }: PageProps) {
    const { slug, path } = await params
    if (!path) return notFound()

    const domain = new StaticResourceDomain()
    const html = await domain.getStaticResource(slug, path.join('/'))
    if (!html) return notFound()

    const dataUrl = `data:text/html;charset=utf-8;base64,${Buffer.from(html, 'utf-8').toString('base64')}`

    return (
        <div className="h-screen w-screen">
            <iframe
                src={dataUrl}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
                className="w-full h-full border-0"
                allow="fullscreen"
            />
        </div>
    )
}
