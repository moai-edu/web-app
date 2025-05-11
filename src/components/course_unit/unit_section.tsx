'use client'
import { Tile, TileStatus, TileType, CourseUnit, STEPS_PER_TILE, Course } from '@/domain/types'
import { UnitHeader } from './unit_header'
import { Fragment, JSX, useCallback, useEffect, useRef, useState } from 'react'
import {
    ActiveBookSvg,
    LockedBookSvg,
    CheckmarkSvg,
    LockedDumbbellSvg,
    FastForwardSvg,
    GoldenBookSvg,
    GoldenDumbbellSvg,
    GoldenTreasureSvg,
    GoldenTrophySvg,
    LockSvg,
    StarSvg,
    LockedTreasureSvg,
    LockedTrophySvg,
    ActiveTreasureSvg,
    ActiveTrophySvg,
    ActiveDumbbellSvg
} from '@/components/Svgs'
import { HoverLabel } from './hover_label'
import { LessonCompletionSvg } from './lesson_completion_svg'
import { TileTooltip } from './tile_tooltip'
import { useRouter } from 'next/navigation'

const tileStatus = (units: CourseUnit[], tile: Tile, lessonsCompleted: number): TileStatus => {
    const lessonsPerTile = STEPS_PER_TILE
    const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile)
    const tiles = units.flatMap((unit) => unit.tiles)
    const tileIndex = tiles.findIndex((t) => t === tile)

    if (tileIndex < tilesCompleted) {
        return 'COMPLETE'
    }
    if (tileIndex > tilesCompleted) {
        return 'LOCKED'
    }
    return 'ACTIVE'
}

const TileIcon = ({ tileType, status }: { tileType: TileType; status: TileStatus }): JSX.Element => {
    switch (tileType) {
        case 'star':
            return status === 'COMPLETE' ? <CheckmarkSvg /> : status === 'ACTIVE' ? <StarSvg /> : <LockSvg />
        case 'book':
            return status === 'COMPLETE' ? (
                <GoldenBookSvg />
            ) : status === 'ACTIVE' ? (
                <ActiveBookSvg />
            ) : (
                <LockedBookSvg />
            )
        case 'dumbbell':
            return status === 'COMPLETE' ? (
                <GoldenDumbbellSvg />
            ) : status === 'ACTIVE' ? (
                <ActiveDumbbellSvg />
            ) : (
                <LockedDumbbellSvg />
            )
        case 'fast-forward':
            return status === 'COMPLETE' ? <CheckmarkSvg /> : status === 'ACTIVE' ? <StarSvg /> : <FastForwardSvg />
        case 'treasure':
            return status === 'COMPLETE' ? (
                <GoldenTreasureSvg />
            ) : status === 'ACTIVE' ? (
                <ActiveTreasureSvg />
            ) : (
                <LockedTreasureSvg />
            )
        case 'trophy':
            return status === 'COMPLETE' ? (
                <GoldenTrophySvg />
            ) : status === 'ACTIVE' ? (
                <ActiveTrophySvg />
            ) : (
                <LockedTrophySvg />
            )
    }
}

const tileLeftClassNames = [
    'left-0',
    'left-[-45px]',
    'left-[-70px]',
    'left-[-45px]',
    'left-0',
    'left-[45px]',
    'left-[70px]',
    'left-[45px]'
] as const

type TileLeftClassName = (typeof tileLeftClassNames)[number]

const getTileLeftClassName = ({
    index,
    unitNumber,
    tilesLength
}: {
    index: number
    unitNumber: number
    tilesLength: number
}): TileLeftClassName => {
    if (index >= tilesLength - 1) {
        return 'left-0'
    }

    const classNames =
        unitNumber % 2 === 1 ? tileLeftClassNames : [...tileLeftClassNames.slice(4), ...tileLeftClassNames.slice(0, 4)]

    return classNames[index % classNames.length] ?? 'left-0'
}

const getTileColors = ({
    tileType,
    status,
    defaultColors
}: {
    tileType: TileType
    status: TileStatus
    defaultColors: `border-${string} bg-${string}`
}): `border-${string} bg-${string}` => {
    switch (status) {
        case 'LOCKED':
            if (tileType === 'fast-forward') return defaultColors
            return 'border-[#b7b7b7] bg-[#e5e5e5]'
        case 'COMPLETE':
            return 'border-yellow-500 bg-yellow-400'
        case 'ACTIVE':
            return defaultColors
    }
}

interface Props {
    id: string // 可以是courseId（查看课程用）或joinedClassId（提交课程作业用）
    units: CourseUnit[]
    unit: CourseUnit
}

export const UnitSection = ({ id, units, unit }: Props): JSX.Element => {
    const router = useRouter()

    const [selectedTile, setSelectedTile] = useState<null | number>(null)

    useEffect(() => {
        const unselectTile = () => setSelectedTile(null)
        window.addEventListener('scroll', unselectTile)
        return () => window.removeEventListener('scroll', unselectTile)
    }, [])

    const closeTooltip = useCallback(() => setSelectedTile(null), [])

    const lessonsCompleted = -1
    const increaseLessonsCompleted = (i: number) => {
        console.log(i)
    }
    const increaseLingots = (i: number) => {
        console.log(i)
    }

    const unitNumber = unit.index + 1
    return (
        <>
            <UnitHeader
                title={`Unit ${unitNumber}`}
                description={unit.name}
                href={`${id}/${unit.index}`}
                backgroundColor={unit.style!.backgroundColor}
                borderColor={unit.style!.borderColor}
            />
            <div className="relative mb-8 mt-[67px] flex max-w-2xl flex-col items-center gap-4">
                {unit.tiles!.map((tile, i): JSX.Element => {
                    const status = tileStatus(units, tile, lessonsCompleted)
                    return (
                        <Fragment key={i}>
                            {(() => {
                                switch (tile.type) {
                                    case 'star':
                                    case 'book':
                                    case 'dumbbell':
                                    case 'trophy':
                                    case 'fast-forward':
                                        if (tile.type === 'trophy' && status === 'COMPLETE') {
                                            return (
                                                <div className="relative">
                                                    <TileIcon tileType={tile.type} status={status} />
                                                    <div className="absolute left-0 right-0 top-6 flex justify-center text-lg font-bold text-yellow-700">
                                                        {unitNumber}
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return (
                                            <div
                                                className={[
                                                    'relative -mb-4 h-[93px] w-[98px]',
                                                    getTileLeftClassName({
                                                        index: i,
                                                        unitNumber,
                                                        tilesLength: unit.tiles!.length
                                                    })
                                                ].join(' ')}
                                            >
                                                {tile.type === 'fast-forward' && status === 'LOCKED' ? (
                                                    <HoverLabel text="Jump here?" textColor={unit.style!.textColor} />
                                                ) : selectedTile !== i && status === 'ACTIVE' ? (
                                                    <HoverLabel text="Start" textColor={unit.style!.textColor} />
                                                ) : null}
                                                <LessonCompletionSvg
                                                    lessonsCompleted={lessonsCompleted}
                                                    status={status}
                                                />
                                                <button
                                                    className={[
                                                        'absolute m-3 rounded-full border-b-8 p-4',
                                                        getTileColors({
                                                            tileType: tile.type,
                                                            status,
                                                            defaultColors: `${unit.style!.borderColor} ${
                                                                unit.style!.backgroundColor
                                                            }`
                                                        })
                                                    ].join(' ')}
                                                    onClick={() => {
                                                        if (tile.type === 'fast-forward' && status === 'LOCKED') {
                                                            void router.push(`/lesson?fast-forward=${unitNumber}`)
                                                            return
                                                        }
                                                        setSelectedTile(i)
                                                    }}
                                                >
                                                    <TileIcon tileType={tile.type} status={status} />
                                                    <span className="sr-only">Show lesson</span>
                                                </button>
                                            </div>
                                        )
                                    case 'treasure':
                                        return (
                                            <div
                                                className={[
                                                    'relative -mb-4',
                                                    getTileLeftClassName({
                                                        index: i,
                                                        unitNumber,
                                                        tilesLength: unit.tiles!.length
                                                    })
                                                ].join(' ')}
                                                onClick={() => {
                                                    if (status === 'ACTIVE') {
                                                        increaseLessonsCompleted(4)
                                                        increaseLingots(1)
                                                    }
                                                }}
                                                role="button"
                                                tabIndex={status === 'ACTIVE' ? 0 : undefined}
                                                aria-hidden={status !== 'ACTIVE'}
                                                aria-label={status === 'ACTIVE' ? 'Collect reward' : ''}
                                            >
                                                {status === 'ACTIVE' && (
                                                    <HoverLabel text="Open" textColor="text-yellow-400" />
                                                )}
                                                <TileIcon tileType={tile.type} status={status} />
                                            </div>
                                        )
                                }
                            })()}
                            <TileTooltip
                                units={units}
                                selectedTile={selectedTile}
                                index={i}
                                unitIndex={unit.index}
                                tilesLength={unit.tiles!.length}
                                description={(() => {
                                    switch (tile.type) {
                                        case 'book':
                                        case 'dumbbell':
                                        case 'star':
                                            return tile.description
                                        case 'fast-forward':
                                            return status === 'LOCKED' ? 'Jump here?' : tile.description
                                        case 'trophy':
                                            return `Unit ${unitNumber} review`
                                        case 'treasure':
                                            return ''
                                    }
                                })()}
                                status={status}
                                closeTooltip={closeTooltip}
                            />
                        </Fragment>
                    )
                })}
            </div>
        </>
    )
}
