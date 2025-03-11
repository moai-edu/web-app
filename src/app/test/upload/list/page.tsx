// src/app/upload/list/page.tsx
import { Resource } from "sst";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListImages() {
    // 创建 S3 客户端
    const s3Client = new S3Client({});

    // 列出 S3 存储桶中的所有对象
    const command = new ListObjectsV2Command({
        Bucket: Resource.DataBucket.name,
    });
    const response = await s3Client.send(command);

    // 获取所有图片文件的 Key
    const imageFiles =
        response.Contents?.filter((file) =>
            file.Key?.match(/\.(jpg|jpeg|png)$/i)
        ) || [];

    return (
        <div>
            <h1>Uploaded Images</h1>
            <ul>
                {imageFiles.map((file) => (
                    <li key={file.Key}>
                        <Link href={`/test/upload/view/${file.Key}`}>
                            {file.Key}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
