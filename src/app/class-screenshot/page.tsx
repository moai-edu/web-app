"use client";

import React from "react";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Card, Image, Space } from "antd";
const { Meta } = Card;

export default function ClassScreenShotPage() {
    const [current, setCurrent] = React.useState(0);

    return (
        <div>
            <h1>查看班级截图</h1>
            <Image.PreviewGroup
                preview={{
                    toolbarRender: (
                        _,
                        {
                            transform: { scale },
                            actions: { onZoomOut, onZoomIn },
                        }
                    ) => (
                        <Space size={12} className="toolbar-wrapper">
                            {current}
                            <ZoomOutOutlined
                                disabled={scale === 1}
                                onClick={onZoomOut}
                            />
                            <ZoomInOutlined
                                disabled={scale === 50}
                                onClick={onZoomIn}
                            />
                        </Space>
                    ),
                    onChange: (current, prev) => {
                        setCurrent(current);
                        console.log(
                            `current index: ${current}, prev index: ${prev}`
                        );
                    },
                }}
            >
                <div className="flex flex-wrap justify-center">
                    {Array.from({ length: 16 }, (_, i) => (
                        <div key={i} className="px-2 py-2">
                            <Card
                                title={"学生" + (i + 1)}
                                hoverable
                                style={{ width: 140 }}
                                cover={
                                    <Image
                                        alt=""
                                        src="https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp"
                                        onClick={() => setCurrent(i)}
                                    />
                                }
                            >
                                <Meta title={"得分"} description={i + 1} />
                            </Card>
                        </div>
                    ))}
                </div>
            </Image.PreviewGroup>
        </div>
    );
}
