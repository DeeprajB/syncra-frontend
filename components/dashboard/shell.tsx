import Link from "next/link"

import { AccountMenu } from "@/components/dashboard/account-menu"
import { NotificationButton } from "@/components/dashboard/notification-button"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher"
import { SyncraMark } from "@/components/syncra-mark"
import type { Workspace } from "@/lib/workspaces"

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
  workspaces,
  children,
}: {
  name?: string | null
  email?: string | null
  picture?: string
  workspaces?: Workspace[]
  children: React.ReactNode
}) {
  return (
    <div className="syncra-canvas flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <SyncraMark className="size-6" />
            <span className="font-heading text-sm font-semibold tracking-[-0.01em]">
              Syncra
            </span>
          </Link>
          <WorkspaceSwitcher workspaces={workspaces ?? []} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationButton />
          <AccountMenu
            name={name ?? undefined}
            initials={initials(name, email)}
            email={email ?? undefined}
            picture={picture}
          />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="w-full border-b border-[#E2E8F0] bg-white px-3 py-4 md:w-60 md:shrink-0 md:border-r md:border-b-0">
          <SidebarNav workspaces={workspaces} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
