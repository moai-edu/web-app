console.log(`Custom Provider uses region: ap-east-1`)
export const provider = new aws.Provider('CustomProvider', {
    region: 'ap-east-1'
})
