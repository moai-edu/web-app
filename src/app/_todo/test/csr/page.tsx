"use client"; // 客户端组件

import { useState, useEffect } from "react";

export default function CSRPage() {
    const [time, setTime] = useState("");
    const [awsVersion, setAwsVersion] = useState("加载中...");

    useEffect(() => {
        // 设置初始时间
        setTime(new Date().toLocaleString());

        // 发送请求到 /api/aws-version 获取 AWS SDK 版本号
        fetch("/api/aws-version")
            .then((res) => res.json())
            .then((data) => {
                setAwsVersion(data.awsSdkVersion);
            })
            .catch((err) => {
                console.error("获取 AWS 版本失败:", err);
                setAwsVersion("获取失败");
            });
    }, []);

    return (
        <div>
            <h1>客户端渲染 (CSR) 页面</h1>
            <p>页面加载时的时间: {time}</p>
            <p>AWS SDK 版本: {awsVersion}</p>
        </div>
    );
}
