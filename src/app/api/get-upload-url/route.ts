// import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import s3Client from "@/utils/s3Client";

export async function POST(request: Request) {
    const { fileName } = await request.json();

    const command = new PutObjectCommand({
        Key: fileName,
        Bucket: process.env.DATA_BUCKET_NAME,
    });
    const url = await getSignedUrl(s3Client, command);
    console.log(url);
    return NextResponse.json({ url });
}
