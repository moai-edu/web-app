export const dynamic = "force-dynamic";

import { Resource } from "sst";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function ViewImage({
    params,
}: {
    params: { name: string };
}) {
    // 创建 S3 客户端
    const s3Client = new S3Client({});

    // 获取图片的签名 URL
    const command = new GetObjectCommand({
        Bucket: Resource.DataBucket.name,
        Key: params.name,
    });
    const url = await getSignedUrl(s3Client, command);

    return (
        <div>
            <h1>View Image: {params.name}</h1>
            <img src={url} alt={params.name} style={{ maxWidth: "100%" }} />
        </div>
    );
}
