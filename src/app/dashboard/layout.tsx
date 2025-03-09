import { ThemeProvider } from "next-themes";
import Header from "@/components/layouts/dashboard/header";
import Footer from "@/components/layouts/dashboard/footer";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex flex-col min-h-screen">
                <Header />
                <h1>Dashboard Layout</h1>
                {children}
                <Footer />
            </div>
        </ThemeProvider>
    );
}
