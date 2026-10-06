"use client"

import { Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotificationButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="flex size-9 items-center justify-center rounded-full text-[#475569] outline-none hover:bg-[#F1F5F9] focus-visible:ring-3 focus-visible:ring-[#3B82F6]/40"
      >
        <Bell className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-[#64748B]">
            No new notifications
          </DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
