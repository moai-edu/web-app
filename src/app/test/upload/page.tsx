"use client";

export default function Home() {
    return (
        <div>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    const file =
                        (e.target as HTMLFormElement).file.files?.[0] ?? null;

                    if (!file) {
                        alert("Please select a file to upload.");
                        return;
                    }
                    console.log(file);

                    try {
                        // 创建 FormData 对象
                        const formData = new FormData();
                        formData.append("file", file);

                        // 发送文件数据到后端接口
                        const response = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                        });

                        if (response.ok) {
                            alert("File uploaded successfully!");
                        } else {
                            alert("Failed to upload file.");
                        }
                    } catch (error) {
                        console.error("Error uploading file:", error);
                        alert("An error occurred while uploading the file.");
                    }
                }}
            >
                <input
                    name="file"
                    type="file"
                    accept="image/png, image/jpeg, text/markdown, .md"
                />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}
