const region: string = process.env.SST_AWS_REGION!
console.log(`Custom Provider uses region: ${region}`)
export const provider = new aws.Provider('CustomProvider', {
    region: 'ap-east-1'
})
console.log('Using hard-coded region: ap-east-1')
