import { useMDXComponents } from '@/mdx-components'
import { generateStaticParamsFor, importPage } from 'nextra/pages'

const SSG_PATH_PREFIX = 'static'
export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps) {
    const params = await props.params
    // 从路径中移除前缀部分
    const mdxPathWithoutPrefix = params.mdxPath?.filter((segment) => segment !== SSG_PATH_PREFIX) || []
    const { metadata } = await importPage(mdxPathWithoutPrefix, params.lang)
    return metadata
}

type PageProps = Readonly<{
    params: Promise<{
        mdxPath: string[]
        lang: string
    }>
}>
const Wrapper = useMDXComponents().wrapper

export default async function Page(props: PageProps) {
    const params = await props.params
    // 从路径中移除前缀部分
    const mdxPathWithoutPrefix = params.mdxPath?.filter((segment) => segment !== SSG_PATH_PREFIX) || []
    const result = await importPage(mdxPathWithoutPrefix, params.lang)
    const { default: MDXContent, toc, metadata } = result

    return (
        <Wrapper toc={toc} metadata={metadata}>
            <MDXContent {...props} params={params} />
        </Wrapper>
    )
}
