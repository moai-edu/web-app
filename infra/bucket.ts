/// <reference path="../.sst/platform/config.d.ts" />

import { customProvider } from './custom-provider'

export const dataBucket = new sst.aws.Bucket('DataBucket', undefined, {
    provider: customProvider
})
