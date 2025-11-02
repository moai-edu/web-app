import { I18nLangKeys } from '@/i18n'
import { s3DataClient } from '@/persist/s3'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { User } from 'next-auth'
import StudentsTable from './students-table'
import { ClassDomain } from '@/domain/class_domain'

import './students-table.css'
import { CourseQuizSubmitDomain } from '@/domain/course_quiz_submit_domain'
import { ExcelUploadForm } from './excel-upload-form'
import { getStudentXlsxKey } from '@/lib/utils'

type Props = Readonly<{
    params: Promise<{ lang: I18nLangKeys; classId: string }>
}>

async function fetchAndParseExcel(key: string): Promise<unknown[]> {
    const downloadUrl = await s3DataClient.getSignedUrl(key)
    const response = await fetch(downloadUrl)
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(firstSheet)
}

function getSortedStudentNames(
    joinedUserScoreMap: Map<string, number>
): string[] {
    const sorted_student_names = Array.from(joinedUserScoreMap.keys())
    sorted_student_names.sort((a, b) => {
        const scoreA = joinedUserScoreMap.get(a) || 0 // 0 if not found
        const scoreB = joinedUserScoreMap.get(b) || 0
        return scoreA - scoreB
    })
    return sorted_student_names
}

function generateNormallyDistributedScores(
    sorted_student_names: string[],
    max: number,
    min: number,
    std_dev: number
): Map<string, number> {
    const scoreMap = new Map<string, number>()
    const mean = (min + max) / 2 // Calculate mean as midpoint
    const numStudents = sorted_student_names.length

    // Generate normally distributed percentiles for ranking
    const percentiles = generateNormalPercentiles(numStudents)

    // Map percentiles to scores within min/max range
    for (let i = 0; i < numStudents; i++) {
        // Convert percentile to actual score
        let score = mean + percentiles[i] * std_dev

        // Apply min/max constraints
        score = Math.max(min, Math.min(max, score))

        // Round to nearest integer
        score = Math.round(score)

        // Assign to student (in sorted order)
        scoreMap.set(sorted_student_names[i], score)
    }

    return scoreMap
}

// Helper function to generate normally distributed percentiles (-3 to 3)
function generateNormalPercentiles(count: number): number[] {
    const percentiles: number[] = []
    const step = 6 / (count - 1) // Spread from -3 to 3 standard deviations

    for (let i = 0; i < count; i++) {
        percentiles.push(-3 + i * step)
    }

    return percentiles
}

export default async function Page({ params }: Props) {
    const { lang, classId } = await params
    const classDomain = new ClassDomain()
    const createdClass = await classDomain.getById(classId)
    if (!createdClass) {
        return <div>Class not found</div>
    }
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
    const joinedUserMap = new Map<string, User>()
    joinedUsers.forEach((joinedUser) => {
        if (joinedUser.user && joinedUser.user.name) {
            joinedUserMap.set(joinedUser.user.name, joinedUser.user)
        }
    })

    // 获取已加入班级的用户的总分成绩
    const courseQuizSubmitDomain = new CourseQuizSubmitDomain()
    const joinedUserScoreMap = new Map<string, number>()
    for (const joinedUser of joinedUsers) {
        const userScore =
            await courseQuizSubmitDomain.getUserJoinClassTotalScore(
                joinedUser.id
            )
        joinedUserScoreMap.set(joinedUser!.user!.name!, userScore)
    }

    // 按用户总分成绩的排名，生成正态分布的随机数做为平时成绩和期末成绩（录入教务系统用）
    const sorted_student_names = getSortedStudentNames(joinedUserScoreMap)
    const joinedUserRegularScoreMap = generateNormallyDistributedScores(
        sorted_student_names,
        100,
        60,
        5
    )
    const joinedUserFinalScoreMap = generateNormallyDistributedScores(
        sorted_student_names,
        90,
        60,
        7
    )

    // 将数据转换为可序列化的格式
    const serializedStudentsData = studentsData
        ? JSON.parse(JSON.stringify(studentsData))
        : null
    // console.log(serializedStudentsData)

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {`学生管理 - ${createdClass.name}`}
            </h1>
            <ExcelUploadForm classId={classId} downloadUrl={downloadUrl} />
            {serializedStudentsData && serializedStudentsData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">学生名单</h2>
                    <StudentsTable
                        studentsData={serializedStudentsData}
                        joinedUserMap={joinedUserMap}
                        joinedUserScoreMap={joinedUserScoreMap}
                        joinedUserRegularScoreMap={joinedUserRegularScoreMap}
                        joinedUserFinalScoreMap={joinedUserFinalScoreMap}
                    />
                </div>
            )}
        </div>
    )
}
