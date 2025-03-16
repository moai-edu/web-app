"use client";

import { Image } from "antd";
import { useState } from "react";

interface ImageData {
    src: string;
}

// 导出一个默认的函数组件Page
export default function Page() {
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [placeHolderText, setPlaceHolderText] = useState<string>("");

    function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
        // const studentId = event.currentTarget.getAttribute('data-id')
        const items = event.clipboardData.items;
        let file: File | null = null;
        let imageType: string | undefined = undefined;
        // Find pasted image among pasted items
        for (let i = 0; i < items.length; i++) {
            console.log(items[i]);
            if (items[i].type.indexOf("image") === 0) {
                imageType = items[i].type;
                file = items[i].getAsFile();
                break;
            }
        }
        if (!file || !imageType) {
            // logError('剪贴板中没有图片')
            return;
        }
        const ext = imageType.split("/")[1];

        const uploadFileName = `image.${ext}`;

        // 创建一个新的 Blob 对象，使用新的文件名
        const blob = new Blob([file], { type: imageType });
        const uploadFile = new File([blob], uploadFileName, {
            type: imageType,
        });

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append("file", uploadFile);

        // 发送文件数据到后端接口
        fetch("/api/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    console.log(`上传图片成功: ${uploadFileName}`);
                    setImageData({ src: URL.createObjectURL(file) });
                } else {
                    throw new Error("上传图片失败");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div className="flex flex-col">
            {/* 一个textarea，用于粘贴图片，当粘贴时调用handlePaste函数，当改变时清空placeholderText的值，初始值为空字符串 */}
            <textarea
                placeholder="使用Ctrl+V在这里粘贴图片"
                onPaste={handlePaste}
                onChange={() => setPlaceHolderText("")}
                value={placeHolderText}
            ></textarea>
            {/* 一个Image组件，alt属性为空字符串，src属性为一个图片链接 */}
            <Image
                alt="剪贴板图片"
                src={imageData?.src || "/placeholder.svg"}
            />
        </div>
    );
}
