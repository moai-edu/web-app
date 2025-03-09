import React from "react";
import { signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function GetStarted() {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("cognito");
            }}
        >
            <Button>Get started</Button>
        </form>
    );
}

export function SignOut({
    ...props
}: React.ComponentPropsWithRef<typeof Button>) {
    return (
        <form
            action={async () => {
                "use server";
                await signOut();
            }}
            className="w-full"
        >
            <Button {...props}>Logout</Button>
        </form>
    );
}
