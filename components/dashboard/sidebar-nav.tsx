"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Folder, LayoutGrid, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Workspace } from "@/lib/workspaces"

export function SidebarNav({ workspaces }: { workspaces?: Workspace[] }) {
  const pathname = usePathname()
  const workspaceId = pathname.match(/^\/dashboard\/workspaces\/([^/]+)/)?.[1]
  const workspaceIsKnown =
    !workspaces ||
    !workspaceId ||
    workspaces.some((workspace) => workspace.id === workspaceId)

  if (!workspaceId || !workspaceIsKnown) {
    return <PlatformNav pathname={pathname} />
  }

  const base = `/dashboard/workspaces/${workspaceId}`
  const items = [
    { href: base, label: "Dashboard", icon: LayoutGrid, exact: true },
    { href: `${base}/projects`, label: "Projects", icon: Folder },
    { href: `${base}/members`, label: "Members", icon: Users },
    { href: `${base}/activity`, label: "Activity", icon: Activity },
  ]

  return (
    <nav className="flex flex-col gap-1">
      <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
        Workspace navigation
      </p>
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={
            item.exact ? pathname === item.href : pathname.startsWith(item.href)
          }
        />
      ))}
      <div className="my-1 h-px bg-[#E2E8F0]" />
      <NavLink
        href={`${base}/settings`}
        label="Settings"
        icon={Settings}
        active={pathname.startsWith(`${base}/settings`)}
      />
    </nav>
  )
}

function PlatformNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
        Platform
      </p>
      <NavLink
        href="/dashboard"
        label="Dashboard"
        icon={LayoutGrid}
        active={pathname === "/dashboard"}
      />
    </nav>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof LayoutGrid
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#475569] hover:bg-[#F1F5F9]",
        active && "bg-[#3B82F6] text-white hover:bg-[#3B82F6]"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}
