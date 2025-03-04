// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = "force-dynamic"; // 强制每次都进行 SSR，必须增加这行，否则因为会尽可能缓存，所以SSR不会生效

export default function Home() {
    const time = new Date().toLocaleString();

    // 打印日志到 Lambda 控制台
    console.log("🟢 [SSR] 服务器端渲染触发");
    console.log(`🕒 当前服务器时间: ${time}`);

    return (
        <div>
            <h1>服务器端渲染的页面 (App Router)</h1>
            <p>当前服务器时间: {time}</p>
        </div>
    );
}
