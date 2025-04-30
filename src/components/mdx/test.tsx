'use client'

import { UserJoinClass } from '@/domain/types'
import { Button } from '@radix-ui/themes'

interface Props {
    model?: UserJoinClass
}
export default function Test({ model }: Props) {
    if (!model) return <div>no model</div>
    return (
        <div>
            <code>
                <pre>{JSON.stringify(model, null, 4)}</pre>
            </code>
            <Button onClick={() => alert('Hello')}>Hello World</Button>
        </div>
    )
}
