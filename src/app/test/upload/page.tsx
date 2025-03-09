export const dynamic = "force-dynamic";

import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import UploadForm from "@/components/upload_form";

export default async function Home() {
    const command = new PutObjectCommand({
        Key: crypto.randomUUID(),
        Bucket: Resource.DataBucket.name,
    });
    const url = await getSignedUrl(new S3Client({}), command);

    return (
        <div>
            <main>
                <UploadForm url={url} />
            </main>
        </div>
    );
}
