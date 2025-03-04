export { auth as middleware } from "@/auth";

/**
 * matcher 是一个数组，里面的字符串定义了哪些 URL 路径会触发auth中间件。
 * "/((?!api|_next/static|_next/image|favicon.ico).*)" 是一个正则表达式，它的作用是：
 * 排除 /api/*（API 路由）
 * 排除 /_next/static/* 和 /_next/image/*（Next.js 静态资源）
 * 排除 /favicon.ico（网站的 favicon）
 * 匹配 所有其他路径（页面路由）
 */

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
