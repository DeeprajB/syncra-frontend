import { redirect } from "next/navigation"
import { Folder } from "lucide-react"

import { WorkspaceActions } from "@/components/dashboard/workspace-actions"
import { FlashToast } from "@/components/flash-toast"
import {
  listWorkspaces,
  redirectToLogin,
  SyncraAuthError,
  syncSyncraUser,
} from "@/lib/api"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[]
    invite?: string | string[]
  }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error)
    ? params.error[0]
    : params.error
  const invite = Array.isArray(params.invite) ? params.invite[0] : params.invite

  let syncError = callbackError

  try {
    await syncSyncraUser()
  } catch (error) {
    if (error instanceof SyncraAuthError) {
      await redirectToLogin()
    }
    syncError = error instanceof Error ? error.message : "Failed to sync user"
  }

  const listed = await listWorkspaces()

  if (listed.ok && listed.workspaces.length > 0) {
    const id = listed.workspaces[0].id
    redirect(
      invite
        ? `/dashboard/workspaces/${id}?invite=${encodeURIComponent(invite)}`
        : `/dashboard/workspaces/${id}`
    )
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      {syncError ? (
        <FlashToast
          type="error"
          title="User sync failed"
          description={syncError}
          clearErrorParam
        />
      ) : null}
      {!listed.ok ? (
        <FlashToast
          type="error"
          title="Couldn't load workspaces"
          description={listed.message}
        />
      ) : null}

      <div className="flex flex-1 items-center justify-center py-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
            <Folder className="size-5" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-[-0.025em] text-[#0F172A]">
            Welcome to Syncra
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-pretty text-[#64748B]">
            Create or join a workspace to start collaborating with your team.
          </p>
          <WorkspaceActions initialInvite={invite} openJoin={Boolean(invite)} />
        </div>
      </div>
    </main>
  )
}
