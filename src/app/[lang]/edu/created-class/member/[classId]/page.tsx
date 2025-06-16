import { I18nLangKeys } from '@/i18n'
import { s3DataClient } from '@/persist/s3'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { Table } from '@radix-ui/themes'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { User } from 'next-auth'
import { StudentsTable } from './students-table'

type Props = Readonly<{
    params: Promise<{ lang: I18nLangKeys; classId: string }>
}>

export default async function Page({ params }: Props) {
    const { lang, classId } = await params

    // 检查文件是否存在
    const xlsxKey = `created-class/${classId}/students.xlsx`
    const xlsKey = `created-class/${classId}/students.xls`
    const xlsxExists = await s3DataClient.isFileExists(xlsxKey)
    const xlsExists = await s3DataClient.isFileExists(xlsKey)

    // 获取下载链接和文件内容
    let downloadUrl = null
    let studentsData = null

    async function fetchAndParseExcel(key: string): Promise<void> {
        downloadUrl = await s3DataClient.getSignedUrl(key)
        const response = await fetch(downloadUrl)
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        studentsData = XLSX.utils.sheet_to_json(firstSheet)
    }

    if (xlsxExists) {
        await fetchAndParseExcel(xlsxKey)
    } else if (xlsExists) {
        await fetchAndParseExcel(xlsKey)
    }

    // 获取已加入班级的用户列表
    const userJoinClassDomain = new UserJoinClassDomain()
    const joinedUsers = await userJoinClassDomain.getListByClassId(classId)

    // 创建用户姓名到用户的映射
    const userMap = new Map<string, User>()
    joinedUsers.forEach((joinedUser) => {
        if (joinedUser.user && joinedUser.user.name) {
            userMap.set(joinedUser.user.name, joinedUser.user)
        }
    })

    // 将 Map 转换为普通对象
    const joinedUserNames = Object.fromEntries(
        Array.from(userMap.keys()).map((name) => [name, true])
    )

    async function uploadStudentsList(formData: FormData) {
        'use server'
        const file = formData.get('file') as File
        if (!file) {
            throw new Error('No file provided')
        }

        // 检查文件类型
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            throw new Error('Only Excel (.xlsx, .xls) files are allowed')
        }

        // 上传到S3
        const key = `created-class/${classId}/students${file.name.substring(
            file.name.lastIndexOf('.')
        )}`
        await s3DataClient.uploadFile(file, key)
    }

    // 处理表头显示，删除'(文本)'
    const formatHeader = (header: string) => {
        return header.replace('(文本)', '').trim()
    }

    // 将数据转换为可序列化的格式
    const serializedStudentsData = studentsData
        ? JSON.parse(JSON.stringify(studentsData))
        : null

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">班级学生管理</h1>
            <div className="mb-4">
                <form action={uploadStudentsList}>
                    <div className="flex gap-4 items-center">
                        <input
                            type="file"
                            name="file"
                            accept=".xlsx, .xls"
                            className="max-w-xs"
                        />
                        <Button type="submit">上传学生名单</Button>
                    </div>
                </form>
            </div>
            {downloadUrl && (
                <div className="mt-4">
                    <Link
                        href={downloadUrl}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        下载已上传的学生名单
                    </Link>
                </div>
            )}
            {serializedStudentsData && serializedStudentsData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">学生名单</h2>
                    <StudentsTable
                        studentsData={serializedStudentsData}
                        formatHeader={formatHeader}
                        joinedUserNames={joinedUserNames}
                    />
                </div>
            )}
        </div>
    )
}
