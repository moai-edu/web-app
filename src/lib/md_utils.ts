import path from 'path'

const RES_FILE_EXTS: Set<string> = new Set([
    'pdf',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'webp',
    'avif',
    'mp4'
])
/*
 * 从一行markdown文本中提取出所引用的资源的路径
 *
 * 参数mdLine为一行markdown文本，以下情况返回资源链接路径：
 *
 * - 链接或图片引用：链接引用：[A sample pdf](./sample.pdf) ，返回./sample.pdf；图像引用：![A sample png](/sample.png) ，返回/sample.png
 * - 背景图片：# My Slide {foo=bar data-background-image=../sample.png data-background-size=contain} ，返回../sample.png
 *
 * 以下情况返回null：
 * - 如果mdLine中没有满足上述资源引用，则返回null；
 * - 如果mdLine中所引用的资源文件不存在后缀名，或者后缀名不在 RES_FILE_EXTS的常量数组中，则返回null。
 */
export function extractResourceFromMdLine(mdLine: string): string | null {
    const linkPattern = /\[(.*?)\]\((.*?)\)/
    const imagePattern = /\!\[(.*?)\]\((.*?)\)/
    const backgroundPattern = /data-background-image=\\"(.*?)\\"/

    let match =
        mdLine.match(linkPattern) ||
        mdLine.match(imagePattern) ||
        mdLine.match(backgroundPattern)
    if (!match) return null

    let filePath = match[2].trim()
    if (!filePath) return null

    const ext = filePath.split('.').pop()
    if (!ext || !RES_FILE_EXTS.has(ext)) return null

    return filePath
}

/*
 * 把markdown文本中所引用的资源的路径转换为绝对路径
 * 被引用资源在s3 bucket中的路径按如下规则计算：
 * - 如果路径本身就是以反斜杠开头的绝对路径，则返回去掉首个反斜杠的路径。
 * - 如果路径是相对路径，则相对于目录entryFileDir计算绝对路径，要求最后返回的绝对路径中不包含任何 "." 或 ".." 符号，
 *
 * 例子：
 *   - 对于参数 entryFileDir 为任意值，参数resFilePath为 "/sample.pdf"，则返回路径计算结果为："sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，参数resFilePath为 "sample.pdf"，则返回路径计算结果为："foo/bar/sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，参数resFilePath为 "./sample.pdf"，则返回路径计算结果为："foo/bar/sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，参数resFilePath为 "../sample.pdf"，则返回路径计算结果为："foo/sample.pdf"；
 *   - 对于参数 entryFileDir 为 "foo/bar"，参数resFilePath为 "../../sample.pdf"，则返回路径计算结果为："sample.pdf"；

 * @param entryFileDir 当前markdown文件所在的目录
 * @param resFilePath markdown文本中所引用的资源路径
 * @returns 绝对路径
 */
export function getAbsFilePath(
    entryFileDir: string,
    resFilePath: string
): string {
    if (resFilePath.startsWith('/')) {
        return resFilePath.slice(1)
    } else {
        return path.join(entryFileDir, resFilePath)
    }
}
