import { z } from 'zod'

const RESERVED_SLUGS = ['public', 'admin']

export const nameZodSchema = z.string().min(2, '姓名至少需要2个字符').max(50, '姓名最多50个字符')
export const slugZodSchema = z
    .string()
    .min(3, 'Slug至少需要3个字符')
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符')
    .refine((slug) => !RESERVED_SLUGS.includes(slug), { message: '该Slug是保留关键词，请选择其他Slug' })

export const updateUserClientSchema = z.object({
    name: nameZodSchema,
    slug: slugZodSchema
})
