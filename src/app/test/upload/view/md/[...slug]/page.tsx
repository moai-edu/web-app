export const dynamic = "force-dynamic";

import { replaceResourcesWithS3SignedUrls } from "@/utils/mdTools";
import s3DataClient from "@/utils/s3_data_client";
import { MDXRemote } from "next-mdx-remote/rsc";
import path from "path";
import { Suspense } from "react";

export default async function ViewMarkdown({
    params,
}: {
    params: Promise<{ slug: string[] | undefined }>;
}) {
    // https://nextjs.org/docs/messages/sync-dynamic-apis
    const { slug } = await params;
    const name = slug!.join("/");

    const source = await s3DataClient.getMdContent(name);
    // 要把source中的资源链接全部用getSignedUrl方法替换成客户端可以访问的链接
    const newSource = await replaceResourcesWithS3SignedUrls(
        s3DataClient,
        path.dirname(name),
        source
    );
    return (
        <div>
            <h1>View Markdown: {name}</h1>
            <Suspense fallback={<>Loading...</>}>
                <MDXRemote source={newSource} />
            </Suspense>{" "}
        </div>
    );
}
