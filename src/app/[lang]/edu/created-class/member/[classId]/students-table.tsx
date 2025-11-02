'use client'

import { useLocale } from '@/hooks'
import { Table } from '@radix-ui/themes'
import { User } from 'next-auth'
import { useState } from 'react'

type SortConfig = {
    key: string
    direction: 'asc' | 'desc'
}

type StudentsTableProps = {
    studentsData: Record<string, unknown>[]
    joinedUserMap: Map<string, User>
    joinedUserScoreMap: Map<string, number>
    joinedUserRegularScoreMap: Map<string, number>
    joinedUserFinalScoreMap: Map<string, number>
}

// 处理表头显示，删除'(文本)'
const formatHeader = (header: string) => {
    return header.replace('(文本)', '').trim()
}

export default function StudentsTable({
    studentsData,
    joinedUserMap,
    joinedUserScoreMap,
    joinedUserRegularScoreMap,
    joinedUserFinalScoreMap
}: StudentsTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const { t, currentLocale } = useLocale()

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedData = [...studentsData].sort((a, b) => {
        if (!sortConfig) return 0

        const aName = String(a['姓名(文本)'])
        const bName = String(b['姓名(文本)'])

        let aValue = 0
        let bValue = 0

        if (sortConfig.key === '平时成绩(文本)') {
            aValue = joinedUserRegularScoreMap.get(aName) || 0
            bValue = joinedUserRegularScoreMap.get(bName) || 0
        } else if (sortConfig.key === '期末成绩(文本)') {
            aValue = joinedUserFinalScoreMap.get(aName) || 0
            bValue = joinedUserFinalScoreMap.get(bName) || 0
        } else {
            aValue = Number(a[sortConfig.key]) || 0
            bValue = Number(b[sortConfig.key]) || 0
        }

        return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue
    })

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return '↕️'
        return sortConfig.direction === 'asc' ? '↑' : '↓'
    }

    // Helper function to get display value for score columns
    const getScoreDisplayValue = (studentName: string) => {
        const hasJoined = joinedUserMap.has(studentName)
        if (!hasJoined) return '-'
        const score = joinedUserScoreMap.get(studentName)
        return score !== undefined ? score : '-'
    }
    const getRegularScoreDisplayValue = (studentName: string) => {
        const hasJoined = joinedUserMap.has(studentName)
        if (!hasJoined) return '-'
        const score = joinedUserRegularScoreMap.get(studentName)
        return score !== undefined ? score : '-'
    }
    const getFinalScoreDisplayValue = (studentName: string) => {
        const hasJoined = joinedUserMap.has(studentName)
        if (!hasJoined) return '-'
        const score = joinedUserFinalScoreMap.get(studentName)
        return score !== undefined ? score : '-'
    }

    return (
        <div className="border rounded-lg">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        {Object.keys(studentsData[0]).map((header) => (
                            <Table.ColumnHeaderCell key={header}>
                                {header === '平时成绩(文本)' ||
                                header === '期末成绩(文本)' ? (
                                    <button
                                        onClick={() => handleSort(header)}
                                        className="flex items-center gap-1 hover:text-blue-600"
                                    >
                                        {formatHeader(header)}
                                        <span>{getSortIcon(header)}</span>
                                    </button>
                                ) : (
                                    formatHeader(header)
                                )}
                            </Table.ColumnHeaderCell>
                        ))}
                        <Table.ColumnHeaderCell>
                            加入班级
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>总分</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortedData.map(
                        (row: Record<string, unknown>, index: number) => {
                            const studentName = String(row['姓名(文本)'])
                            const hasJoined = joinedUserMap.has(studentName)

                            return (
                                <Table.Row key={index}>
                                    {Object.entries(row).map(
                                        ([key, value], cellIndex) => {
                                            // For the first column (name)
                                            if (cellIndex === 0) {
                                                return (
                                                    <Table.RowHeaderCell
                                                        key={cellIndex}
                                                    >
                                                        {String(value)}
                                                    </Table.RowHeaderCell>
                                                )
                                            }

                                            // For score columns
                                            if (key === '平时成绩(文本)') {
                                                return (
                                                    <Table.Cell key={cellIndex}>
                                                        {getRegularScoreDisplayValue(
                                                            studentName
                                                        )}
                                                    </Table.Cell>
                                                )
                                            }
                                            if (key === '期末成绩(文本)') {
                                                return (
                                                    <Table.Cell key={cellIndex}>
                                                        {getFinalScoreDisplayValue(
                                                            studentName
                                                        )}
                                                    </Table.Cell>
                                                )
                                            }

                                            // For other columns
                                            return (
                                                <Table.Cell key={cellIndex}>
                                                    {String(value)}
                                                </Table.Cell>
                                            )
                                        }
                                    )}
                                    <Table.Cell>
                                        {hasJoined ? '是' : '否'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {getScoreDisplayValue(studentName)}
                                    </Table.Cell>
                                </Table.Row>
                            )
                        }
                    )}
                </Table.Body>
            </Table.Root>
        </div>
    )
}
