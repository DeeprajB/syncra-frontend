"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

const tones = [
  "bg-[#6366F1]",
  "bg-[#0EA5E9]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
  "bg-[#8B5CF6]",
]

export function PersonAvatar({
  name,
  avatarUrl,
  className,
  title,
}: {
  name: string
  avatarUrl?: string
  className?: string
  title?: string
}) {
  const [failed, setFailed] = useState(false)
  const label = title || name
  if (avatarUrl && !failed) {
    return (
      // Avatars come from the Syncra API.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        title={label}
        referrerPolicy="no-referrer"
        className={cn("size-6 rounded-full object-cover", className)}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      title={label}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
        tone(name),
        className
      )}
    >
      {initials(name)}
    </span>
  )
}

function initials(name: string) {
  const parts = name
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "S").toUpperCase()
}

function tone(name: string) {
  let hash = 0
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % tones.length
  }
  return tones[hash]
}
