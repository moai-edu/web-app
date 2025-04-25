import { auth } from '@/auth'
import { ClassDomain } from '@/domain/class_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { PlusIcon } from '@radix-ui/react-icons'
import { Button, Dialog, Flex, Link, Table, Text, TextField } from '@radix-ui/themes'

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
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button>
                            <PlusIcon /> {t('routeHome.routeJoinedClass.join')}
                        </Button>
                    </Dialog.Trigger>

                    <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Edit profile</Dialog.Title>
                        <Dialog.Description size="2" mb="4">
                            Make changes to your profile.
                        </Dialog.Description>

                        <Flex direction="column" gap="3">
                            <label>
                                <Text as="div" size="2" mb="1" weight="bold">
                                    Name
                                </Text>
                                <TextField.Root defaultValue="Freja Johnsen" placeholder="Enter your full name" />
                            </label>
                        </Flex>

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Dialog.Close>
                                <Button>Save</Button>
                            </Dialog.Close>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>{t('name')}</Table.ColumnHeaderCell>
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
                                <Flex gap="3">JOIN/LEAVE</Flex>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </>
    )
}
