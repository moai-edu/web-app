export const dynamic = "force-dynamic";

// import { Resource } from "sst";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "@/utils/s3Client"; // 导入 S3Client

export default async function ViewImage({
    params,
}: {
    params: { name: string };
}) {
    // https://nextjs.org/docs/messages/sync-dynamic-apis
    const { name } = await params;

    // 获取图片的签名 URL
    const command = new GetObjectCommand({
        Bucket: process.env.DATA_BUCKET_NAME,
        Key: name,
    });
    const url = await getSignedUrl(s3Client, command);

    return (
        <div>
            <h1>View Image: {name}</h1>
            <img src={url} alt={name} style={{ width: "300px" }} />
        </div>
    );
}
