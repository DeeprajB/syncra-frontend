"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronDown, Plus, UserPlus } from "lucide-react"

import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog"
import { JoinWorkspaceDialog } from "@/components/dashboard/join-workspace-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Workspace } from "@/lib/workspaces"

export function WorkspaceSwitcher({
  workspaces = [],
}: {
  workspaces?: Workspace[]
}) {
  const pathname = usePathname()
  const currentId = pathname.match(/^\/dashboard\/workspaces\/([^/]+)/)?.[1]
  const current =
    workspaces.find((workspace) => workspace.id === currentId) ?? workspaces[0]
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  if (!current) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="hidden h-5 w-px bg-[#E2E8F0] sm:block" />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 max-w-72 min-w-0 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none hover:bg-[#F8FAFC] focus-visible:ring-3 focus-visible:ring-[#3B82F6]/40">
          <span className="size-2 shrink-0 rounded-full bg-[#10B981]" />
          <span className="truncate">{current.title}</span>
          <ChevronDown className="size-3.5 shrink-0 text-[#64748B]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                render={<Link href={`/dashboard/workspaces/${workspace.id}`} />}
              >
                <span className="size-2 shrink-0 rounded-full bg-[#10B981]" />
                <span className="truncate">{workspace.title}</span>
                {workspace.id === current.id ? (
                  <Check className="ml-auto size-4 text-[#3B82F6]" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 text-[#64748B]" />
              Create workspace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setJoinOpen(true)}>
              <UserPlus className="size-4 text-[#64748B]" />
              Join a workspace
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog
        hideTrigger
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <JoinWorkspaceDialog
        hideTrigger
        open={joinOpen}
        onOpenChange={setJoinOpen}
      />
    </div>
  )
}
