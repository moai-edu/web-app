import { NextResponse } from "next/server";

export async function GET() {
    // 获取所有服务器端环境变量
    const envVars = process.env;

    // 过滤掉值为 undefined 的环境变量（防止 JSON.stringify 出错）
    const filteredEnvVars = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(envVars).filter(([_, value]) => value !== undefined)
    );

    return NextResponse.json(filteredEnvVars);
}
