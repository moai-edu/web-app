import { UserJoinClass } from '@/domain/types'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Cross1Icon } from '@radix-ui/react-icons'
import { AlertDialog, Em, Flex, Button } from '@radix-ui/themes'
import { revalidatePath } from 'next/cache'

interface Props {
    model: UserJoinClass
    lang: I18nLangKeys
}

export default async function LeaveClassButton({ model, lang }: Props) {
    const { t } = await useServerLocale(lang)

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <Button variant="soft" color="crimson">
                    <Cross1Icon /> {t('leave')}
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="500px">
                <AlertDialog.Title>
                    {t('leave')}: <Em>{model.class!.name}</Em>
                </AlertDialog.Title>
                <AlertDialog.Description size="2">{t('leaveConfirm')}</AlertDialog.Description>
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
                                const domain = new UserJoinClassDomain()
                                try {
                                    const joinedClass = await domain.delete(model.id)
                                    if (joinedClass) {
                                        console.log('left class:', joinedClass)
                                        revalidatePath('/home/joined-class')
                                    } else {
                                        throw new Error('failed to leave class')
                                    }
                                } catch (e) {
                                    console.log('failed to leave class', model)
                                    console.error(e)
                                }
                            }}
                        >
                            <Button color="red">{t('leave')}</Button>
                        </form>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}
