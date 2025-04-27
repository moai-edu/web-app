import { auth } from '@/auth'
import { ClassDomain } from '@/domain/class_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { PlusIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link, Table } from '@radix-ui/themes'
import EditNameButton from './edit_name_button'
import DeleteClassButton from './delete_class_button'
import CopyCodeButton from './copy_code_button'

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
    const domain = new ClassDomain()
    const classList = await domain.getListByUserId(session.user.id)

    return (
        <>
            <Flex justify="end" width="100%" pr="4">
                <Button asChild>
                    <Link href="/new/class">
                        <PlusIcon /> {t('routeHome.routeCreatedClass.create')}
                    </Link>
                </Button>
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>{t('name')}</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>{t('invitationCode')}</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>{t('ops')}</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {classList.map((classItem) => (
                        <Table.Row key={classItem.id}>
                            <Table.RowHeaderCell>
                                <Link href={`/class/${classItem.id}`}>{classItem.name}</Link>
                            </Table.RowHeaderCell>
                            <Table.Cell>
                                <CopyCodeButton code={classItem.code} />
                            </Table.Cell>
                            <Table.Cell>
                                <Flex gap="3">
                                    <EditNameButton id={classItem.id} name={classItem.name} lang={lang} />
                                    <DeleteClassButton id={classItem.id} name={classItem.name} lang={lang} />
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </>
    )
}
