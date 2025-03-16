import { S3DataClient } from "./s3_data_client";

const RES_FILE_EXTS: Set<string> = new Set([
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
]);

/**
 * 从 markdown 文本中查找所有被引用的资源在s3 bucket中的路径，返回资源引用路径全部被s3 signed url替换以后的markdown文本；如果没有任何资源路径需要替换，则返回原始的 markdown 文本。
 *
 * 被引用资源在s3 bucket中的路径按如下规则计算：
 * - 如果路径本身就是以反斜杠开头的绝对路径，则直接返回去除首个反斜杠的路径，例如：/sample.pdf -> sample.pdf；
 * - 如果路径是相对路径，则返回其相对于入口文件所在的目录（由参数 entryFileDir 指定）的路径，要求最后返回的s3 bucket中的路径中不包含任何 "." 或 ".." 符号，例如：
 *   - 对于参数 entryFileDir 为 "foo/bar"，路径替换为： "./sample.pdf" -> "foo/bar/sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，路径替换为： "../sample.pdf" -> "foo/sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，路径替换为： "../../sample.pdf" -> "sample.pdf"；
 *   - 对于参数 entryFileDir 为 ""，路径替换为： "./sample.pdf" -> "sample.pdf"；
 *   - 对于参数 entryFileDir 为 ""，路径替换为： "./foo/bar/sample.pdf" -> "foo/bar/sample.pdf"；
 *
 * 支持的markdown所引用的资源类型有以下3种（假设entryFileDir为foo/bar）：
 * - 链接引用：[A sample pdf](./sample.pdf) ，先提取出s3路径：foo/bar/sample.pdf，再将./sample.pdf替换为foo/bar/sample.pdf的s3 signed url
 * - 图片绝对路径引用：![A sample png](/sample.png) ，先取出去除首个反斜杠的s3路径：sample.png，再将/sample.png替换为sample.png的s3 signed url
 * - 图片相对路径引用：![A sample png](./sample.png)，先取出s3路径：foo/bar/sample.png，再将./sample.png替换为foo/bar/sample.png的s3 signed url
 * - 背景图片：# My Slide {data-background-image=../sample.png data-background-size=contain} ，先出s3路径：foo/sample.png，再将../sample.png替换为foo/sample.png的s3 signed url
 *
 * 以一个资源文件的绝对路径为参数，调用函数入参s3DataClient的getSignedUrl 方法即可以返回该资源文件对应的 s3  signed url，并替换 markdown 文本中的原始路径为 s3 signed url。
 *
 * 注意：
 * - markdown 文本中所引用的资源文件必须存在后缀名，且后缀名必须在 RES_FILE_EXTS 中，否则会被忽略，不替换。
 * - s3DataClient的getSignedUrl方法接收1个参数，即资源文件的路径，返回该资源文件的 s3  signed url，并且该方法是一个asnyc方法，需要await调用。
 *
 * @param s3DataClient S3DataClient 对象实例
 * @param entryFileDir 入口文件所在的目录
 * @param markdownText 入口文件的Markdown 文本
 * @returns 资源引用路径全部被s3 signed url替换以后的markdown文本
 */
export async function replaceResourcesWithS3SignedUrls(
    s3DataClient: S3DataClient,
    entryFileDir: string,
    markdownText: string
): Promise<string> {
    // not yet implemented
}
