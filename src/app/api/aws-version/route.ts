import { NextResponse } from "next/server";

// 动态导入 AWS SDK 并获取版本号
export async function GET() {
    let awsSdkVersion = "未安装";
    try {
        const pkg = await import("@aws-sdk/client-s3/package.json");
        awsSdkVersion = pkg.version;
    } catch (error) {
        console.error("获取 AWS SDK 版本失败:", error);
    }

    return NextResponse.json({ awsSdkVersion });
}
