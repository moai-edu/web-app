'use client'

import type { AllLocales, I18nLangKeys, LocaleKeys, PathValue } from '@/i18n'
import { getNestedValue, i18nConfig, interpolateString } from '@/i18n'
import { useParams } from 'next/navigation' // 改用 next/navigation
import { useCallback } from 'react'

// 类型获取给定键的本地化值的类型
type LocalizedValue<T, K extends LocaleKeys> = PathValue<T, K> extends string ? string : PathValue<T, K>

// t 函数的完整类型声明
export type TFunction = {
    // 不带插值参数的调用方式
    <K extends LocaleKeys>(key: K): LocalizedValue<AllLocales, K>

    // 带插值参数的调用方式
    <K extends LocaleKeys>(key: K, withData: Record<string, any>): LocalizedValue<AllLocales, K>
}

export const useLocale = () => {
    const params = useParams()

    // 从 URL 参数中获取当前语言
    const currentLocale = ((params?.lang as I18nLangKeys) || 'en') as I18nLangKeys

    const t = useCallback(
        <K extends LocaleKeys>(key: K, withData: Record<string, any> = {}): LocalizedValue<AllLocales, K> => {
            const template = getNestedValue(i18nConfig[currentLocale], key)

            if (typeof template === 'string') {
                return interpolateString(template, withData) as LocalizedValue<AllLocales, K>
            }

            return template as LocalizedValue<AllLocales, K>
        },
        [currentLocale]
    )

    return {
        currentLocale,
        t
    }
}
