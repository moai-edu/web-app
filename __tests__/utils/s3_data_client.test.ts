import { s3DataClient } from "@/persist/s3";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("S3DataClient.getMarkdownTextWithS3SignedUrls", () => {
    beforeEach(() => {
        vi.spyOn(s3DataClient, "getMdContent")
            .mockResolvedValue(`# Sample Markdown
    ![Image](./image.png)
    [PDF File](../docs/sample.pdf)
    # Slide {data-background-image=/assets/bg.jpg data-background-size=contain}`);
        vi.spyOn(s3DataClient, "getSignedUrl").mockImplementation(
            async (key) => `https://signed-url.com/${key}`
        );
    });

    it("should replace resource paths with signed URLs", async () => {
        const result = await s3DataClient.getMarkdownTextWithS3SignedUrls(
            "docs/index.md"
        );

        expect(result).toContain("https://signed-url.com/docs/image.png");
        expect(result).toContain("https://signed-url.com/docs/sample.pdf");
        expect(result).toContain("https://signed-url.com/assets/bg.jpg");
    });
});
