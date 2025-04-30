'use client'

import React, { useState } from 'react'
import { Drawer } from 'antd'
import TaskSteps from './task_steps'
import { CourseStep } from '@/domain/types'
import { Box, Button, Flex } from '@radix-ui/themes'
import { ExitIcon } from '@radix-ui/react-icons'

interface MobileDrawerProps {
    steps: CourseStep[]
    tileIndex: number
    stepIndex: number
}

export default function MobileDrawerTaskSteps({ steps, tileIndex, stepIndex }: MobileDrawerProps) {
    const [open, setOpen] = useState(false)

    const showDrawer = () => {
        setOpen(true)
    }

    const onClose = () => {
        setOpen(false)
    }

    const onExit = () => {
        window.location.href = '..'
    }

    return (
        <Box>
            <Flex justify="between" width="100%" pt="4" px="4">
                <Button onClick={showDrawer}>{`当前第${stepIndex + 1}步 / 总共${steps.length}步`}</Button>
                <Button onClick={onExit} color="crimson">
                    <ExitIcon /> 退出
                </Button>
            </Flex>
            <Drawer title="任务步骤" onClose={onClose} open={open} placement="left" width={300}>
                <TaskSteps tileIndex={tileIndex} stepIndex={stepIndex} steps={steps} />
            </Drawer>
        </Box>
    )
}
