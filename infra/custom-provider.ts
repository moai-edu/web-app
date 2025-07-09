const region: string = process.env.SST_AWS_REGION!
export const provider = new aws.Provider('CustomProvider', { region })
