import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/utils/s3Client"; // 导入 S3Client
// import { Resource } from "sst";

export async function POST(request: Request) {
    try {
        // 解析 FormData
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // 将文件转换为 Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // 上传文件到 S3
        const command = new PutObjectCommand({
            Bucket: process.env.DATA_BUCKET_NAME, // S3 存储桶名称
            Key: file.name, // 使用文件名作为 S3 对象的 Key
            Body: buffer, // 文件内容
            ContentType: file.type, // 文件类型
        });
        await s3Client.send(command);

        return NextResponse.json({ message: "File uploaded successfully!" });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the file" },
            { status: 500 }
        );
    }
}
