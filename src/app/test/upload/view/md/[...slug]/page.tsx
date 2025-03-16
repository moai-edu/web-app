export const dynamic = "force-dynamic";

import s3DataClient from "@/utils/s3_data_client";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";

export default async function ViewMarkdown({
    params,
}: {
    params: Promise<{ slug: string[] | undefined }>;
}) {
    // https://nextjs.org/docs/messages/sync-dynamic-apis
    const { slug } = await params;
    const name = slug!.join("/");

    const source = await s3DataClient.getMarkdownTextWithS3SignedUrls(name);
    return (
        <div>
            <h1>View Markdown: {name}</h1>
            <Suspense fallback={<>Loading...</>}>
                <MDXRemote source={source} />
            </Suspense>{" "}
        </div>
    );
}
