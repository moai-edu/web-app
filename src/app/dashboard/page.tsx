import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { GetStarted } from "@/features/authentication/auth-components";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth();
    return (
        <div className="flex flex-row gap-5">
            {session && (
                <Button asChild>
                    <Link href="/protected-page/session">Session </Link>
                </Button>
            )}
            {!session && <GetStarted />}
        </div>
    );
}
