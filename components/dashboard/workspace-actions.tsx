"use client"

import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog"
import { JoinWorkspaceDialog } from "@/components/dashboard/join-workspace-dialog"
import { cn } from "@/lib/utils"

export function WorkspaceActions({
  align = "center",
  initialInvite = "",
  openJoin = false,
}: {
  align?: "center" | "start"
  initialInvite?: string
  openJoin?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "center" ? "mt-6 justify-center" : "justify-end"
      )}
    >
      <CreateWorkspaceDialog />
      <JoinWorkspaceDialog
        defaultInvite={initialInvite}
        defaultOpen={openJoin}
      />
    </div>
  )
}
