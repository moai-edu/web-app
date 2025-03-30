import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // If using with Turbopack, you'll need to add the following to your next.config.js until this issue is resolved:
    // https://github.com/hashicorp/next-mdx-remote
    transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
