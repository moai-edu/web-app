import { auth } from '@/auth'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Flex, Link, Table } from '@radix-ui/themes'
import JoinClassDlg from './join_class_dlg'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import LeaveClassButton from './leave_class_button'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params
    const { t } = await useServerLocale(lang)

    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return <div>Not authenticated</div>
    }

    const domain = new UserJoinClassDomain()
    const list = await domain.getListByUser(session.user)

    return (
        <>
            <Flex justify="end" width="100%" pr="4">
                <JoinClassDlg />
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>{t('name')}</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>{t('ops')}</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {list.map((model) => (
                        <Table.Row key={model.id}>
                            <Table.RowHeaderCell>
                                <Link href={`/u/${session.user!.slug}/course/${model.class!.courseId}`}>
                                    {model.class!.name}
                                </Link>
                            </Table.RowHeaderCell>
                            <Table.Cell>
                                <LeaveClassButton model={model} lang={lang} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </>
    )
}
