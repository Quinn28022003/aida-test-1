import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
    title: "Aida Vault",
    description: "Vault service health check."
};

type RootLayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en-AU">
            <body>
                <main className="page">
                    <div className="card">{children}</div>
                </main>
            </body>
        </html>
    );
}
