// src/app/upload/list/page.tsx
// import { Resource } from "sst";
import { s3DataClient } from '@/persist/s3'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ListImages() {
    const resFiles = await s3DataClient.listFiles('test/')
    return (
        <div>
            <Link href="/test/upload">Upload</Link>
            <h1>Uploaded Files</h1>
            <ul>
                {resFiles.map((file) =>
                    file.endsWith('.md') ? (
                        <li key={file}>
                            <Link href={`/test/upload/view/md/${file}`}>
                                {file}
                            </Link>
                        </li>
                    ) : (
                        <li key={file}>
                            <Link href={`/test/upload/view/res/${file}`}>
                                {file}
                            </Link>
                        </li>
                    )
                )}
            </ul>
        </div>
    )
}
