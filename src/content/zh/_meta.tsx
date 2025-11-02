import type { MetaRecord } from 'nextra'
import { TitleBadge } from '@/components/TitleBadge'

export default {
    index: {
        type: 'page',
        display: 'hidden',
        theme: {
            timestamp: false,
            layout: 'full',
            toc: false
        }
    },
    introduction: {
        type: 'page',
        display: 'hidden',
        title: '这是介绍',
        theme: {
            navbar: true,
            toc: false
        }
    },
    examples: {
        title: '示例',
        display: 'hidden',
        type: 'page'
    },
    upgrade: {
        title: (
            <span className="flex items-center leading-[1]">
                新变化
                <TitleBadge />
            </span>
        ),
        display: 'hidden',
        type: 'page'
    }
} satisfies MetaRecord
