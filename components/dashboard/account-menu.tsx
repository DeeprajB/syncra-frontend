"use client"

import { useState } from "react"
import { ChevronDown, LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountMenu({
  initials,
  email,
  picture,
}: {
  initials: string
  email?: string
  picture?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const showPicture = Boolean(picture) && !imageFailed

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="flex items-center gap-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-[#3B82F6]/40"
      >
        {showPicture ? (
          // Profile photos come from Auth0 (Google, Gravatar, and others).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={picture}
            alt=""
            className="size-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-[#3B82F6] text-[11px] font-semibold text-white">
            {initials}
          </span>
        )}
        <ChevronDown className="size-4 text-[#64748B]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {email ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel>{email}</DropdownMenuLabel>
          </DropdownMenuGroup>
        ) : null}
        {email ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem render={<a href="/auth/logout" />}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
