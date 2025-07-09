/// <reference path="../.sst/platform/config.d.ts" />

import { provider } from './custom-provider'

export const dataBucket = new sst.aws.Bucket('DataBucket', undefined, {
    provider
})
