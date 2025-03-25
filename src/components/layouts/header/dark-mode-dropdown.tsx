'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { DropdownMenu } from '@radix-ui/themes'
const DarkModeDropDown = () => {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="1">
                <DropdownMenu.Item onClick={() => setTheme('light')}>
                    Light
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setTheme('dark')}>
                    Dark
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setTheme('system')}>
                    System
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}
export default DarkModeDropDown
