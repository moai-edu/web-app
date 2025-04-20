'use client'

import { I18nLangKeys, LocaleKeys, AllLocales, PathValue } from '@/i18n'
import { getNestedValue, i18nConfig, interpolateString } from '@/i18n'
import { useLocale } from '@/contexts/locale-context'

type LocalizedValue<T, K extends LocaleKeys> = PathValue<T, K> extends string ? string : PathValue<T, K>

export function useClientLocale() {
    const { lang } = useLocale()

    function t<K extends LocaleKeys>(key: K, withData: Record<string, any> = {}): LocalizedValue<AllLocales, K> {
        const template = getNestedValue(i18nConfig[lang], key)

        if (typeof template === 'string') {
            return interpolateString(template, withData) as LocalizedValue<AllLocales, K>
        }

        return template as LocalizedValue<AllLocales, K>
    }

    return {
        t,
        lang
    }
}
