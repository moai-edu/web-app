import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import {
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { Resource } from "sst";

const RES_FILE_EXTS: Set<string> = new Set([
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "webp",
    "mp4",
]);

export class S3DataClient {
    s3Client: S3Client;
    readonly DATA_BUCKET_NAME =
        process.env.NODE_ENV === "development"
            ? process.env.DATA_BUCKET_NAME
            : Resource.DataBucket.name;

    constructor() {
        let conf: S3ClientConfig = {};

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
            //ci环境下使用环境变量
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

    /**
     * 从参数entryFilePath指定的markdown 文件的内容中，查找所有被引用的资源在s3 bucket中的路径，返回资源引用路径全部由s3 signed url替换以后的markdown文本；如果没有任何资源路径需要替换，则返回原始的 markdown 文本。
     *
     * 首先，要计算entryFileDir=path.dirname(entryFilePath)，entryFileDir为入口markdown文件所在的目录，用于计算相对路径的资源引用路径。
     *
     * 被引用资源在s3 bucket中的路径按如下规则计算：
     * - 如果路径本身就是以反斜杠开头的绝对路径，则直接返回去除首个反斜杠的路径，例如：/sample.pdf -> sample.pdf；
     * - 如果路径是相对路径，则相对于入口文件所在的目录计算出资源文件在s3 bucket中的路径，要求最后返回的s3 bucket中的路径中不包含任何 "." 或 ".." 符号，例如：
     *   - 对于参数 entryFileDir 为 "foo/bar"，路径"./sample.pdf"的s3路径计算结果为："foo/bar/sample.pdf"；
     *   - 对于参数 entryFileDir 为 "foo/bar"，路径"../sample.pdf"的s3路径计算结果为："foo/sample.pdf"；
     *   - 对于参数 entryFileDir 为 "foo/bar"，路径"../../sample.pdf"的s3路径计算结果为："sample.pdf"；
     *   - 对于参数 entryFileDir 为 "."，路径"./sample.pdf"的s3路径计算结果为："sample.pdf"；
     *   - 对于参数 entryFileDir 为 "."，路径"./foo/bar/sample.pdf"的s3路径计算结果为："foo/bar/sample.pdf"；
     *
     * markdown所引用的资源类型有以下3种（以下假设entryFileDir="foo/bar"）：
     * - 链接引用：[A sample pdf](./sample.pdf) ，先算出s3路径：foo/bar/sample.pdf，再将./sample.pdf替换为foo/bar/sample.pdf的s3 signed url
     * - 图片绝对路径引用：![A sample png](/sample.png) ，先算出去除首个反斜杠的s3路径：sample.png，再将/sample.png替换为sample.png的s3 signed url
     * - 图片相对路径引用：![A sample png](./sample.png)，先算出s3路径：foo/bar/sample.png，再将./sample.png替换为foo/bar/sample.png的s3 signed url
     * - 背景图片：# My Slide {data-background-image=../sample.png data-background-size=contain} ，先算出s3路径：foo/sample.png，再将../sample.png替换为foo/sample.png的s3 signed url
     *
     * 以一个资源文件的绝对路径为参数，调用this.getSignedUrl(key: string)方法即可以返回该资源文件对应的 s3 signed url，并替换 markdown 文本中的原始路径为 s3 signed url。
     *
     * 注意：
     * - markdown 文本中所引用的资源文件必须存在后缀名，且后缀名必须在 RES_FILE_EXTS 中，否则会被忽略，不替换。
     * - getSignedUrl方法接收1个参数，即资源文件的s3路径，返回该资源文件的 s3 signed url，并且该方法是一个asnyc方法，需要await调用。
     *
     * @param entryMdFilePath 入口markdown文件在s3 bucket中的路径
     * @returns 资源引用路径全部被s3 signed url替换以后的入口markdown文本
     */
    async getMarkdownTextWithS3SignedUrls(
        entryMdFilePath: string
    ): Promise<string> {
        // 计算入口文件所在的目录
        const entryFileDir = path.dirname(entryMdFilePath);

        // 获取入口文件原始的 markdown 文本
        let content = await this.getMdContent(entryMdFilePath);

        // 正则匹配三种资源引用方式
        const resourcePattern =
            /(!?\[.*?\]\()(.+?)(\))|(\{.*?data-background-image=(.*?)\s.*?\})/g;

        const replacePromises: Promise<{
            original: string;
            replaced: string;
        }>[] = [];

        content.replace(
            resourcePattern,
            (match, _, linkPath, __, backgroundMatch, backgroundPath) => {
                const filePath = linkPath || backgroundPath;
                if (!filePath) return match;

                // 计算 S3 存储路径
                let s3FilePath: string;
                if (filePath.startsWith("/")) {
                    s3FilePath = filePath.slice(1); // 移除开头的斜杠
                } else {
                    s3FilePath = path
                        .join(entryFileDir, filePath)
                        .replace(/\\/g, "/");
                }

                // 解析相对路径，确保无 "." 和 ".."
                s3FilePath = path
                    .normalize(s3FilePath)
                    .replace(/\\/g, "/")
                    .replace(/^\.\//, "");

                // 仅处理允许的文件类型
                const ext = s3FilePath.split(".").pop()?.toLowerCase();
                if (!ext || !RES_FILE_EXTS.has(ext)) return match;

                // 异步获取 signed URL
                replacePromises.push(
                    this.getSignedUrl(s3FilePath).then((signedUrl) => ({
                        original: filePath,
                        replaced: signedUrl,
                    }))
                );

                return match;
            }
        );

        const replacements = await Promise.all(replacePromises);
        for (const { original, replaced } of replacements) {
            content = content.replace(original, replaced);
        }

        return content;
    }
}

const s3DataClient = new S3DataClient();
export default s3DataClient;
