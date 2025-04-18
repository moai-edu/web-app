import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { PlusIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link, Table } from '@radix-ui/themes'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params
    const { t } = await useServerLocale(lang)

    return (
        <>
            <Flex justify="end" width="100%" pr="4">
                <Button asChild>
                    <Link href="../../new">
                        <PlusIcon /> {t('createClass')}
                    </Link>
                </Button>
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>{t('createdClassName')}</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>{t('createdClassCode')}</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>{t('createdClassOps')}</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row>
                        <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
                        <Table.Cell>danilo@example.com</Table.Cell>
                        <Table.Cell>Developer</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                        <Table.Cell>zahra@example.com</Table.Cell>
                        <Table.Cell>Admin</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                        <Table.Cell>jasper@example.com</Table.Cell>
                        <Table.Cell>Developer</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </>
    )
}
