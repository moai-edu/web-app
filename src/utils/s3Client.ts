import { S3Client } from "@aws-sdk/client-s3";

let conf = null;

if (process.env.NODE_ENV === "development") {
    conf = {
        endpoint: process.env.AWS_ENDPOINT_URL, // LocalStack 的地址
        region: process.env.AWS_REGION, // 区域
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!, // 访问密钥
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // 秘密密钥
        },
        forcePathStyle: true, // 使用路径样式访问
    };
} else {
    conf = {};
}

const s3Client = new S3Client(conf);

export default s3Client;
