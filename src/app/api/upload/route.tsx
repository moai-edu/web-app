import { NextResponse } from "next/server";
import s3DataClient from "@/utils/s3_data_client";

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

        // 上传文件到 S3
        s3DataClient.uploadFile(file, `test/${file.name}`);

        // 返回成功响应
        return NextResponse.json({ message: "File uploaded successfully!" });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the file" },
            { status: 500 }
        );
    }
}
