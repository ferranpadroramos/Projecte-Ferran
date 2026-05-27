import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Providers from "./providers"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Social Valorant",
    description: "La xarxa social de la comunitat Valorant",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ca">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <Header />
                    <div style={{background: 'linear-gradient(to right, rgba(255,70,85,0.12) 0%, rgba(255,70,85,0.12) 25%, white 25%, white 75%, rgba(255,70,85,0.12) 75%, rgba(255,70,85,0.12) 100%)', minHeight: '100vh'}}>
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
