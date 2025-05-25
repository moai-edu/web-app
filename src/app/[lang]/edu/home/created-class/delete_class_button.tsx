import { ClassDomain } from '@/domain/class_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Cross1Icon } from '@radix-ui/react-icons'
import { AlertDialog, Em, Flex, Button } from '@radix-ui/themes'
import { revalidatePath } from 'next/cache'

interface Props {
    id: string
    name: string
    lang: I18nLangKeys
}

export default async function DeleteClassButton({ id, name, lang }: Props) {
    const { t } = await useServerLocale(lang)

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <Button variant="soft" color="crimson">
                    <Cross1Icon /> {t('delete')}
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="500px">
                <AlertDialog.Title>
                    {t('delete')}: <Em>{name}</Em>
                </AlertDialog.Title>
                <AlertDialog.Description size="2">{t('deleteConfirm')}</AlertDialog.Description>
                <Flex gap="3" justify="end">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">
                            {t('cancel')}
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <form
                            action={async () => {
                                'use server'
                                const domain = new ClassDomain()
                                const savedClass = await domain.delete(id)
                                if (savedClass) {
                                    console.log('deleted class', savedClass)
                                    revalidatePath('/home/created-class')
                                } else {
                                    console.log('failed to delete class', id)
                                }
                            }}
                        >
                            <Button color="red">{t('delete')}</Button>
                        </form>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}
