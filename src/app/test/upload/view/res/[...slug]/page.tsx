import s3DataClient from "@/utils/s3_data_client";

export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string[] | undefined }>;
}) {
    // https://nextjs.org/docs/messages/sync-dynamic-apis
    const { slug } = await params;

    const name = slug!.join("/");
    // 获取图片的签名 URL
    const url = await s3DataClient.getSignedUrl(name);

    return (
        <div>
            <h1>View Image: {name}</h1>
            <img src={url} alt={name} style={{ width: "300px" }} />
        </div>
    );
}
