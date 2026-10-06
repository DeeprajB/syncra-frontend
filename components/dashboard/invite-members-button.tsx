"use client"

import { useTransition } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { createWorkspaceInvite } from "@/app/dashboard/workspace-actions"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

async function copyInvite(workspaceId: string) {
  const result = await createWorkspaceInvite(workspaceId)
  if (!result.ok) {
    toast.error("Couldn't create an invite", { description: result.message })
    return
  }

  try {
    await navigator.clipboard.writeText(result.inviteUrl)
    toast.success("Invite link copied", { description: result.inviteUrl })
  } catch {
    toast.success("Invite link ready", { description: result.inviteUrl })
  }
}

export function InviteMembersButton({ workspaceId }: { workspaceId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      className="h-9 border-[#E2E8F0] bg-white px-3 font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
      onClick={() =>
        startTransition(async () => {
          await copyInvite(workspaceId)
        })
      }
    >
      {pending ? <Spinner /> : <UserPlus className="size-4" />}
      Invite members
    </Button>
  )
}
