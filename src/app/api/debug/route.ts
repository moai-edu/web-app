export async function GET() {
    console.log("✅ API Route /api/debug 被调用");
    return new Response("API Route 调试成功", { status: 200 });
}
