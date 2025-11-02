import { GuidebookSvg } from '@/components/Svgs'
import { useLocale } from '@/hooks'
import Link from 'next/link'

interface Props {
    title: string
    description: string
    href: string
    backgroundColor: `bg-${string}`
    borderColor: `border-${string}`
}
export const UnitHeader = ({ title, description, href, backgroundColor, borderColor }: Props) => {
    const { t } = useLocale()
    return (
        <article className={['max-w-2xl text-white sm:rounded-xl', backgroundColor].join(' ')}>
            <header className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-lg">{description}</p>
                </div>
                <Link
                    href={href}
                    className={[
                        'flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3 transition hover:text-gray-100',
                        borderColor
                    ].join(' ')}
                >
                    <GuidebookSvg />
                    <span className="sr-only font-bold uppercase lg:not-sr-only">{t('guidebook')}</span>
                </Link>
            </header>
        </article>
    )
}
