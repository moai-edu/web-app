export const dynamic = 'force-dynamic'

type PageProps = Readonly<{
    params: Promise<{ slug: string; resourceId: string }>
}>

export default async function Page({ params }: PageProps) {
    const { slug, resourceId } = await params
    return (
        <div>{slug}-{resourceId}</div>
    )
}
