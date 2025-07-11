// 这里不能使用环境变量，折腾好久...放弃，直接hardcode了
console.log(
    'Custom Provider uses different region. prod => ap-southeast-1(Singapore), dev => ap-east-1(Hong Kong)'
)
export const provider = new aws.Provider('CustomProvider', {
    region: $app.stage === 'prod' ? 'ap-southeast-1' : 'ap-east-1'
})
