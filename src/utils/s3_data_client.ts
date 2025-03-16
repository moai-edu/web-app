import { S3Client } from "@aws-sdk/client-s3";
import {
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3DataClient {
    s3Client: S3Client;
    readonly DATA_BUCKET_NAME = process.env.DATA_BUCKET_NAME;

    constructor() {
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

        this.s3Client = new S3Client(conf);
    }

    async uploadFile(file: File, key: string): Promise<void> {
        const buffer = Buffer.from(await file.arrayBuffer());

        const params = {
            Bucket: this.DATA_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type, // 文件类型
        };
        await this.s3Client.send(new PutObjectCommand(params));
    }

    async listFiles(prefix: string): Promise<string[]> {
        // 列出 S3 存储桶中的所有对象
        const command = new ListObjectsV2Command({
            Bucket: this.DATA_BUCKET_NAME,
            Prefix: prefix,
        });
        const response = await this.s3Client.send(command);

        // 获取所有图片文件的 Key
        const resFiles =
            response.Contents?.filter((file) =>
                file.Key?.match(/\.(jpg|jpeg|png|md)$/i)
            ) || [];
        return resFiles.map((file) => file.Key!);
    }

    async getMdContent(key: string): Promise<string> {
        // 获取 markdown 文件的内容
        const command = new GetObjectCommand({
            Bucket: this.DATA_BUCKET_NAME,
            Key: key,
        });
        const response = await this.s3Client.send(command);
        const source = await response.Body?.transformToString("utf-8");
        if (!source) {
            throw new Error("File not found");
        }
        return source;
    }

    async getSignedUrl(key: string): Promise<string> {
        const expiresIn = 60 * 5; // 5 minutes
        // 获取图片的签名 URL
        const command = new GetObjectCommand({
            Bucket: this.DATA_BUCKET_NAME,
            Key: key,
        });
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn,
        });
        return url;
    }
}

const s3DataClient = new S3DataClient();
export default s3DataClient;
