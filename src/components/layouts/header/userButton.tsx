import { GetStarted, SignOut } from '@/features/authentication/auth-components'
import { Session } from 'next-auth'
import {
    Box,
    Button,
    Flex,
    Popover,
    Avatar,
    DataList,
    Link
} from '@radix-ui/themes'
import { PersonIcon } from '@radix-ui/react-icons'

interface UserButtonProps {
    session: Session | null
}

const UserButton: React.FC<UserButtonProps> = ({ session }) => {
    if (!session?.user) return <GetStarted />

    return (
        <div className="flex gap-2 items-center">
            <span className="hidden text-sm sm:inline-flex"></span>

            <Popover.Root>
                <Popover.Trigger>
                    <Button variant="soft">
                        <PersonIcon width="16" height="16" />
                        {session.user.name}
                    </Button>
                </Popover.Trigger>
                <Popover.Content width="360px">
                    <Flex gap="3">
                        <Avatar
                            size="2"
                            src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
                            fallback="A"
                            radius="full"
                        />
                        <Box flexGrow="1">
                            <DataList.Root>
                                <DataList.Item>
                                    <DataList.Label minWidth="88px">
                                        姓名：
                                    </DataList.Label>
                                    <DataList.Value>
                                        {session.user.name}
                                    </DataList.Value>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.Label minWidth="88px">
                                        邮箱：
                                    </DataList.Label>
                                    <DataList.Value>
                                        <Link
                                            href={`mailto:${session.user.email}`}
                                        >
                                            {session.user.email}
                                        </Link>
                                    </DataList.Value>
                                </DataList.Item>
                            </DataList.Root>
                            <Flex gap="3" mt="3" justify="between">
                                <Popover.Close>
                                    <SignOut />
                                </Popover.Close>
                            </Flex>
                        </Box>
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}

export default UserButton
