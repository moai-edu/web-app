import { useServerLocale } from '@/hooks'
import { I18nLangKeys } from '@/i18n'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text, Button, TextField } from '@radix-ui/themes'

interface Props {
    id: string
    name: string
    lang: I18nLangKeys
}

export default async function EditNameButton({ id, name, lang }: Props) {
    const { t } = await useServerLocale(lang)

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button variant="soft">
                    <Pencil2Icon /> {t('edit')}
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Edit</Dialog.Title>
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
    )
}
