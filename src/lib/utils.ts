import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getStudentXlsxKey(classId: string): string {
    return `created-class/${classId}/students.xls`
}
