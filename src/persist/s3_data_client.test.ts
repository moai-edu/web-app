import { s3Client, s3DataClient } from './s3'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

describe('S3DataClient.uploadFile', () => {
    describe('uploadFile succeeds', () => {
        // 准备测试数据
        const mockContent = 'test content'
        const mockFile = new File([mockContent], 'test.txt', { type: 'text/plain' })
        const mockKey = 'test/path/test.txt'
        const mockArrayBuffer = new TextEncoder().encode(mockContent).buffer

        // 模拟 File.arrayBuffer 方法
        Object.defineProperty(mockFile, 'arrayBuffer', {
            value: vi.fn().mockResolvedValue(mockArrayBuffer),
            writable: true
        })

        async function clearMockKey() {
            // 删除测试文件
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: s3DataClient.bucketName,
                    Key: mockKey
                })
            )
        }

        // beforeEach & afterEach 将s3 bucket中的mockKey文件（如果存在）删除
        beforeEach(async () => {
            await clearMockKey()
        })

        afterEach(async () => {
            await clearMockKey()
            // 清理所有模拟
            vi.clearAllMocks()
        })

        it('应该正确上传文件到 S3', async () => {
            // 执行测试
            await s3DataClient.uploadFile(mockFile, mockKey)

            // 获取上传的文件内容
            const response = await s3Client.send(
                new GetObjectCommand({
                    Bucket: s3DataClient.bucketName,
                    Key: mockKey
                })
            )

            const uploadedContent = await response.Body?.transformToString()
            expect(uploadedContent).toBe(mockContent)
        })
    })
})

describe('S3DataClient.listFiles', () => {
    describe('listFiles succeeds', () => {
        // 准备测试数据
        const mockContent = 'test content'
        const mockFile = new File([mockContent], 'test.txt', { type: 'text/plain' })
        const mockKeys = ['test/path1/index.md', 'test/path2/index.md', 'test.md', 'test/path3/index.txt']
        const mockArrayBuffer = new TextEncoder().encode(mockContent).buffer

        // 模拟 File.arrayBuffer 方法
        Object.defineProperty(mockFile, 'arrayBuffer', {
            value: vi.fn().mockResolvedValue(mockArrayBuffer),
            writable: true
        })

        async function clearMockKey() {
            // 删除测试文件
            for (const key of mockKeys) {
                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: s3DataClient.bucketName,
                        Key: key
                    })
                )
            }
        }

        // beforeEach & afterEach 将s3 bucket中的mockKey文件（如果存在）删除
        beforeEach(async () => {
            await clearMockKey()
            // 上传测试文件
            for (const key of mockKeys) {
                await s3DataClient.uploadFile(mockFile, key)
            }
        })

        afterEach(async () => {
            await clearMockKey()
            // 清理所有模拟
            vi.clearAllMocks()
        })

        it('应该正确列出 S3中指定目录前缀中的所有文件', async () => {
            // 执行测试
            const files = await s3DataClient.listFiles('test/', 'index.md')
            expect(files).toEqual(['test/path1/index.md', 'test/path2/index.md'])
        })
    })
})

describe('S3DataClient.getMdContent', () => {
    describe('getMdContent succeeds', () => {
        // 准备测试数据
        const mockContent = `---
title: Sample Title
description: Sample Description
cover: /assets/cover.jpg
access: public
---

# Sample Markdown
test content
`
        const mockFile = new File([mockContent], 'test.md', { type: 'text/plain' })
        const mockKey = 'test/path/test.md'
        const mockArrayBuffer = new TextEncoder().encode(mockContent).buffer

        // 模拟 File.arrayBuffer 方法
        Object.defineProperty(mockFile, 'arrayBuffer', {
            value: vi.fn().mockResolvedValue(mockArrayBuffer),
            writable: true
        })

        async function clearMockKey() {
            // 删除测试文件
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: s3DataClient.bucketName,
                    Key: mockKey
                })
            )
        }

        // beforeEach & afterEach 将s3 bucket中的mockKey文件（如果存在）删除
        beforeEach(async () => {
            await clearMockKey()
            // 上传测试文件
            await s3DataClient.uploadFile(mockFile, mockKey)
        })

        afterEach(async () => {
            await clearMockKey()
            // 清理所有模拟
            vi.clearAllMocks()
        })

        it('应该正确取得markdown文件内容', async () => {
            // 执行测试
            const { metadata, content } = await s3DataClient.getMdContent(mockKey)
            expect(metadata).toEqual({
                title: 'Sample Title',
                description: 'Sample Description',
                cover: '/assets/cover.jpg',
                access: 'public'
            })
            expect(content).toBe(`
# Sample Markdown
test content
`)
        })
    })
})
