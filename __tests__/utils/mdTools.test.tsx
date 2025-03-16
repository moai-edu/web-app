import { S3DataClient } from "@/utils/s3_data_client";
import { replaceResourcesWithS3SignedUrls } from "../../src/utils/mdTools";

import { describe, it, expect, vi } from "vitest";

// 创建一个 Mock S3DataClient
const mockS3DataClient = {
    getSignedUrl: vi.fn(async (filePath: string) => {
        return `https://s3.example.com/${filePath}`;
    }),
} as unknown as S3DataClient;

describe.only("replaceResourcesWithS3SignedUrls", () => {
    it("should replace relative resource paths with S3 signed URLs", async () => {
        const markdownText = "An image: ![image](./image.png)";
        const expectedOutput =
            "An image: ![image](https://s3.example.com/foo/image.png)";

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should replace absolute image paths with S3 signed URLs", async () => {
        const markdownText = "An image: ![image](/image.png)";
        const expectedOutput =
            "An image: ![image](https://s3.example.com/foo/image.png)";

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should replace relative image paths with S3 signed URLs", async () => {
        const markdownText = "An image: ![image](images/photo.jpg)";
        const expectedOutput =
            "An image: ![image](https://s3.example.com/foo/images/photo.jpg)";

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should replace data-background-image paths with S3 signed URLs", async () => {
        const markdownText = "# Slide {data-background-image=images/bg.svg}";
        const expectedOutput =
            "# Slide {data-background-image=https://s3.example.com/foo/images/bg.svg}";

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should ignore unsupported file extensions", async () => {
        const markdownText = "A script: <script src='script.js'></script>";
        const expectedOutput = markdownText; // 应当保持不变

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should ignore regular hyperlinks", async () => {
        const markdownText = "A link: [example](https://example.com)";
        const expectedOutput = markdownText; // 应当保持不变

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });

    it("should handle complex mixed cases", async () => {
        const markdownText = `
        # Slide {data-background-image=bg.svg}
        Here is an image: ![image](images/photo.jpg)
        A file: [doc](docs/file.pdf)
        `;
        const expectedOutput = `
        # Slide {data-background-image=https://s3.example.com/foo/bg.svg}
        Here is an image: ![image](https://s3.example.com/foo/images/photo.jpg)
        A file: [doc](https://s3.example.com/foo/docs/file.pdf)
        `;

        const result = await replaceResourcesWithS3SignedUrls(
            mockS3DataClient,
            "foo",
            markdownText
        );
        expect(result).toBe(expectedOutput);
    });
});
