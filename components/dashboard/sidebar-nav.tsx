"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
        Platform
      </p>
      {items.map((item, index) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)

        return (
          <div key={item.href} className="flex flex-col gap-1">
            {index === 1 ? <div className="my-1 h-px bg-[#E2E8F0]" /> : null}
            <Link
              href={item.href}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#475569] hover:bg-[#F1F5F9]",
                active && "bg-[#3B82F6] text-white hover:bg-[#3B82F6]"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
