// src/components/upload_form.tsx
"use client";

import styles from "./upload_form.module.css";

export default function UploadForm() {
    return (
        <form
            className={styles.form}
            onSubmit={async (e) => {
                e.preventDefault();

                const file =
                    (e.target as HTMLFormElement).file.files?.[0] ?? null;

                if (!file) {
                    alert("Please select a file to upload.");
                    return;
                }

                try {
                    // 调用 API 路由获取签名 URL
                    const response = await fetch("/api/get-upload-url", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ fileName: file.name }),
                    });
                    const { url } = await response.json();
                    console.log(url);

                    // 上传文件到 S3
                    const image = await fetch(url, {
                        body: file,
                        method: "PUT",
                        headers: {
                            "Content-Type": file.type,
                            "Content-Disposition": `attachment; filename="${file.name}"`,
                        },
                    });

                    console.log(image);
                } catch (error) {
                    console.error("Error uploading file:", error);
                    alert("An error occurred while uploading the file.");
                }
            }}
        >
            <input name="file" type="file" accept="image/png, image/jpeg" />
            <button type="submit">Upload</button>
        </form>
    );
}
