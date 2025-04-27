'use client'

import { Button } from '@radix-ui/themes'

export default function Test() {
    return (
        <div>
            <Button onClick={() => alert('Hello')}>Hello World</Button>
        </div>
    )
}
