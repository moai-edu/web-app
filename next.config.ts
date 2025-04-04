import createWithNextra from 'nextra'

const withNextra = createWithNextra({
    defaultShowCopyCode: true,
    unstable_shouldAddLocaleToLinks: true
})

/**
 * @type {import("next").NextConfig}
 */
export default withNextra({
    images: {
        unoptimized: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    reactStrictMode: true,
    cleanDistDir: true,
    i18n: {
        locales: ['zh', 'en'],
        defaultLocale: 'zh'
    },
    sassOptions: {
        silenceDeprecations: ['legacy-js-api']
    },
    // https://github.com/hashicorp/next-mdx-remote
    transpilePackages: ['next-mdx-remote']
})
