export const dynamic = "force-dynamic";
import { s3DataClient } from "@/persist/s3";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string; path: string[] }>;
}) {
    const { slug, path } = await params;
    const filePath = `${slug}/${path.join("/")}.md`; // 构建 S3 文件路径

    const source = await s3DataClient.getMarkdownTextWithS3SignedUrls(filePath);

    return (
        <div>
            <Suspense fallback={<>Loading...</>}>
                <MDXRemote source={source} />
            </Suspense>{" "}
        </div>
    );
}
