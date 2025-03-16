import Link from "next/link";

export default function SamplePage() {
    return (
        <div>
            <h1>Home</h1>
            <Link href="/about">About</Link>
        </div>
    );
}
