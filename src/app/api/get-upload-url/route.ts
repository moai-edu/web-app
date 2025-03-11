import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { fileName } = await request.json();

    const command = new PutObjectCommand({
        Key: fileName,
        Bucket: Resource.DataBucket.name,
    });
    const url = await getSignedUrl(new S3Client({}), command);
    console.log(url);
    return NextResponse.json({ url });
}
