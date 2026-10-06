"use client"

import { useState, type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { roleLabel, type WorkspaceMember } from "@/lib/workspaces"

function initials(name: string, email: string) {
  const source = name.trim() || email.trim()
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "S").toUpperCase()
}

export function MemberRow({
  member,
  action,
  flush = false,
}: {
  member: WorkspaceMember
  action?: ReactNode
  flush?: boolean
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const showPicture = Boolean(member.avatarUrl) && !imageFailed

  return (
    <div
      className={
        flush
          ? "flex items-center gap-3 px-4 py-3"
          : "flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5"
      }
    >
      {showPicture ? (
        // Avatars come from the Syncra API.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.avatarUrl}
          alt=""
          className="size-9 shrink-0 rounded-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-xs font-semibold text-white">
          {initials(member.name, member.email)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0F172A]">
          {member.name}
        </p>
        {member.email ? (
          <p className="truncate text-xs text-[#64748B]">{member.email}</p>
        ) : null}
      </div>
      {action ?? (
        <Badge
          variant="outline"
          className="rounded-full border-[#E2E8F0] bg-white px-2 text-[11px] font-medium text-[#475569]"
        >
          {roleLabel(member.role)}
        </Badge>
      )}
    </div>
  )
}
