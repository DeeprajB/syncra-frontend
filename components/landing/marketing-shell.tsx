import Link from "next/link"
import type { ReactNode } from "react"

import { SyncraMark } from "@/components/syncra-mark"
import { buttonVariants } from "@/components/ui/button"
import { auth0 } from "@/lib/auth0"
import { cn } from "@/lib/utils"

const links = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
]

export async function DiveIn({
  children = "Dive in",
}: {
  children?: ReactNode
}) {
  const session = await auth0.getSession()
  const className = cn(
    buttonVariants(),
    "h-9 rounded-lg bg-[#3B82F6] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(15,23,42,0.05)] hover:bg-[#2563EB]"
  )

  if (session) {
    return (
      <Link href="/dashboard" className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href="/auth/login" className={className}>
      {children}
    </a>
  )
}

export async function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="syncra-canvas flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <SyncraMark />
            <span className="font-heading text-base font-semibold tracking-[-0.01em]">
              Syncra
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#475569] md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#0F172A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <DiveIn />
        </div>
        <nav className="flex gap-5 border-t border-[#E2E8F0] px-4 py-2 text-sm text-[#475569] md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#0F172A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <SyncraMark className="size-6" />
              <span className="font-heading text-sm font-semibold">Syncra</span>
            </Link>
            <p className="max-w-sm text-[13px] leading-5 text-[#64748B]">
              A shared workspace for a student team to plan a project, move the
              work, and see what everyone is doing.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#475569]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#0F172A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
