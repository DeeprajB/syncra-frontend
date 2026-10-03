import Link from "next/link"

import { AccountMenu } from "@/components/dashboard/account-menu"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { SyncraMark } from "@/components/syncra-mark"

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || ""
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "S").toUpperCase()
}

export function DashboardShell({
  name,
  email,
  picture,
  children,
}: {
  name?: string | null
  email?: string | null
  picture?: string
  children: React.ReactNode
}) {
  return (
    <div className="syncra-canvas flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <SyncraMark className="size-6" />
          <span className="font-heading text-sm font-semibold tracking-[-0.01em]">
            Syncra
          </span>
        </Link>
        <AccountMenu
          initials={initials(name, email)}
          email={email ?? undefined}
          picture={picture}
        />
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="w-full border-b border-[#E2E8F0] bg-white px-3 py-4 md:w-60 md:border-r md:border-b-0 md:px-3">
          <SidebarNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
