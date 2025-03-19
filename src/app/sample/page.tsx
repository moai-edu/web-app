import Link from "next/link";
import { Flex, Text, Button } from "@radix-ui/themes";
import { auth } from "@/auth";
import { GetStarted, SignOut } from "@/features/authentication/auth-components";

export default async function SamplePage() {
    const session = await auth();
    return (
        <div>
            <div className="flex flex-row gap-5">
                {session && (
                    <Button asChild>
                        <Link href="/protected-page/session">Session </Link>
                    </Button>
                )}
                {session && <SignOut />}
                {!session && <GetStarted />}
            </div>
        </div>
    );
}
