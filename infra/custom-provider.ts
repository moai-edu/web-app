const region: string = process.env.SST_AWS_REGION!
export const customProvider = new aws.Provider('custom-provider', {
    region: `${region}`
})
