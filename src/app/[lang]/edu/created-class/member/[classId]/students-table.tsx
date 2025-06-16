'use client'

import { Table } from '@radix-ui/themes'
import { useState } from 'react'

type SortConfig = {
    key: string
    direction: 'asc' | 'desc'
}

type StudentsTableProps = {
    studentsData: Record<string, unknown>[]
    joinedUserNames: Record<string, boolean>
}

// 处理表头显示，删除'(文本)'
const formatHeader = (header: string) => {
    return header.replace('(文本)', '').trim()
}

export function StudentsTable({
    studentsData,
    joinedUserNames
}: StudentsTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedData = [...studentsData].sort((a, b) => {
        if (!sortConfig) return 0

        const aValue = Number(a[sortConfig.key]) || 0
        const bValue = Number(b[sortConfig.key]) || 0

        if (sortConfig.direction === 'asc') {
            return aValue - bValue
        }
        return bValue - aValue
    })

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return '↕️'
        return sortConfig.direction === 'asc' ? '↑' : '↓'
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
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortedData.map(
                        (row: Record<string, unknown>, index: number) => (
                            <Table.Row key={index}>
                                {Object.entries(row).map(
                                    ([key, value], cellIndex) =>
                                        cellIndex === 0 ? (
                                            <Table.RowHeaderCell
                                                key={cellIndex}
                                            >
                                                {String(value)}
                                            </Table.RowHeaderCell>
                                        ) : (
                                            <Table.Cell key={cellIndex}>
                                                {String(value)}
                                            </Table.Cell>
                                        )
                                )}
                                <Table.Cell>
                                    {joinedUserNames[String(row['姓名'])]
                                        ? '是'
                                        : '否'}
                                </Table.Cell>
                            </Table.Row>
                        )
                    )}
                </Table.Body>
            </Table.Root>
        </div>
    )
}
