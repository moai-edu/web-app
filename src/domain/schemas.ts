import { TFunction } from '@/hooks'
import { z } from 'zod'

const RESERVED_SLUGS = ['public', 'admin']

export const nameZodSchema = (t: TFunction) => {
    return z
        .string()
        .min(2, t('minChar', { min: 2 }))
        .max(50, t('maxChar', { max: 2 }))
}
export const slugZodSchema = (t: TFunction) => {
    return z
        .string()
        .min(3, t('minChar', { min: 3 }))
        .max(30, t('maxChar', { max: 30 }))
        .regex(/^[a-z0-9-]+$/, t('slugValidation'))
        .refine((slug) => !RESERVED_SLUGS.includes(slug), { message: t('reservedValidation') })
}

export const updateUserSchema = (t: TFunction) =>
    z.object({
        name: nameZodSchema(t),
        slug: slugZodSchema(t)
    })

export const createClassSchema = (t: TFunction) =>
    z.object({
        name: nameZodSchema(t),
        courseId: slugZodSchema(t)
    })
