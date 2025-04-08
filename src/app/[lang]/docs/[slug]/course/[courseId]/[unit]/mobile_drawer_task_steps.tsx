'use client'

import React, { useState } from 'react'
import { Drawer } from 'antd'
import TaskSteps from './task_steps'
import { CourseStep } from '@/domain/types'
import { Button } from '@radix-ui/themes'

interface MobileDrawerProps {
    steps: CourseStep[]
    status: 'wait' | 'process' | 'finish' | 'error'
    current: number
}

export default function MobileDrawerTaskSteps({ steps, status, current }: MobileDrawerProps) {
    const [open, setOpen] = useState(false)

    const showDrawer = () => {
        setOpen(true)
    }

    const onClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Button onClick={showDrawer} mt="4" ml="4">
                {`当前第${current + 1}步 / 总共${steps.length}步`}
            </Button>
            <Drawer title="任务步骤" onClose={onClose} open={open} placement="left" width={300}>
                <TaskSteps current={current} status={status} steps={steps} />
            </Drawer>
        </div>
    )
}
