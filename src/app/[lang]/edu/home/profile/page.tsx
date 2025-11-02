import { Button, Container, DataList, Flex, Link } from '@radix-ui/themes'
import { auth } from '@/auth'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { I18nLangKeys } from '@/i18n'
import { useServerLocale } from '@/hooks'

interface Props {
    params: Promise<{ lang: I18nLangKeys }>
}

export default async function Page({ params }: Props) {
    const { lang } = await params
    const { t } = await useServerLocale(lang)

    const session = await auth()

    if (!session || !session.user) {
        // If there's no session, prompt user to log in
        return <h1>Please log in to access this page</h1>
    }

    const user = session.user
    return (
        <Container size="2" p="4">
            <Flex direction="column" gap="3">
                <DataList.Root className="py-8">
                    <DataList.Item>
                        <DataList.Label minWidth="88px">{t('id')}</DataList.Label>
                        <DataList.Value>{user.id}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label minWidth="88px">{t('fullname')}</DataList.Label>
                        <DataList.Value>{user.name}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label minWidth="88px">{t('email')}</DataList.Label>
                        <DataList.Value>
                            <Link href={`mailto:${user.email}`}>{user.email}</Link>
                        </DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.Label minWidth="88px">{t('slug')}</DataList.Label>
                        <DataList.Value>{user.slug}</DataList.Value>
                    </DataList.Item>
                </DataList.Root>
                <Flex justify="start">
                    <Button asChild>
                        <Link href="../edit/profile">
                            <Pencil2Icon /> {t('modifyProfile')}
                        </Link>
                    </Button>
                </Flex>
            </Flex>
        </Container>
    )
}
