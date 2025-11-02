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
    const res = await domain.getStaticHtmlResource(slug, path.join('/'))
    if (!res) return notFound()

    return (
        <>
            <head dangerouslySetInnerHTML={{ __html: res.headHtml }} />
            <body dangerouslySetInnerHTML={{ __html: res.bodyHtml }} />
        </>
    )
}
