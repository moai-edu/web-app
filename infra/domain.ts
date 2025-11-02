export const authDomain =
    $app.stage === 'prod'
        ? `${process.env.AUTH_SUBDOMAIN}.${process.env.DOMAIN}`
        : `${$app.stage}-${process.env.AUTH_SUBDOMAIN}.${process.env.DOMAIN}`

export const appDomain =
    $app.stage === 'prod'
        ? `${process.env.APP_SUBDOMAIN}.${process.env.DOMAIN}`
        : `${$app.stage}-${process.env.APP_SUBDOMAIN}.${process.env.DOMAIN}`
