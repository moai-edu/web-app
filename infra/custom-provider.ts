const region: string = process.env.CUSTOM_PROVIDER_AWS_REGION!
console.log(`Custom Provider uses region: ${region}`)
export const provider = new aws.Provider('CustomProvider', {
    region: $util.Input.value(region)
})
