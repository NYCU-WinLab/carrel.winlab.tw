import type { Metadata } from "next"
import {
  Inter,
  JetBrains_Mono,
  Noto_Sans_JP,
  Noto_Sans_TC,
} from "next/font/google"

import "./globals.css"
import "./figure.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
})
const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Carrel",
  description: "跟 Claude 說要什麼機器，拿回 SSH 指令和網址。",
  metadataBase: new URL("https://carrel.winlab.tw"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        notoSansJp.variable,
        notoSansTc.variable,
        jetbrainsMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
