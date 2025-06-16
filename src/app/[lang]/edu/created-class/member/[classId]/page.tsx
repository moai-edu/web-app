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

function getStudentXlsxKey(classId: string): string {
    return `created-class/${classId}/students.xlsx`
}

async function fetchAndParseExcel(key: string): Promise<unknown[]> {
    const downloadUrl = await s3DataClient.getSignedUrl(key)
    const response = await fetch(downloadUrl)
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(firstSheet)
}

export default async function Page({ params }: Props) {
    const { lang, classId } = await params

    // 检查文件是否存在
    const xlsxKey = getStudentXlsxKey(classId)
    const xlsxExists = await s3DataClient.isFileExists(xlsxKey)

    // 获取下载链接和文件内容
    let downloadUrl = null
    let studentsData = null

    if (xlsxExists) {
        studentsData = await fetchAndParseExcel(xlsxKey)
        downloadUrl = await s3DataClient.getSignedUrl(xlsxKey)
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
        if (!file.name.endsWith('.xlsx')) {
            throw new Error('Only Excel (.xlsx) files are allowed')
        }

        // 上传到S3
        const xlsxKey = getStudentXlsxKey(classId)

        await s3DataClient.uploadFile(file, xlsxKey)
        console.log(`File uploaded successfully: ${xlsxKey}`)
    }

    // 将数据转换为可序列化的格式
    const serializedStudentsData = studentsData
        ? JSON.parse(JSON.stringify(studentsData))
        : null
    // console.log(serializedStudentsData)

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">班级学生管理</h1>
            <div className="mb-4">
                <form action={uploadStudentsList}>
                    <div className="flex gap-4 items-center">
                        <input
                            type="file"
                            name="file"
                            accept=".xlsx"
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
                        joinedUserNames={joinedUserNames}
                    />
                </div>
            )}
        </div>
    )
}
