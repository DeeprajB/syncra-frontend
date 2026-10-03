import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Syncra",
  description:
    "Syncra gives student teams one place to plan projects, manage tasks, and collaborate in real time.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        plusJakarta.variable
      )}
    >
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
