'use client'

import { useLocale } from '@/hooks'
import { CopyIcon } from '@radix-ui/react-icons'
import { Flex, Text, Button } from '@radix-ui/themes'

interface Props {
    code: string
}

export default function CopyCodeButton({ code }: Props) {
    const { t } = useLocale()

    return (
        <Flex gap="1" className="items-center">
            <Text>{code}</Text>
            <Button variant="soft" onClick={() => navigator.clipboard.writeText(code)}>
                <CopyIcon /> {t('copy')}
            </Button>
        </Flex>
    )
}
