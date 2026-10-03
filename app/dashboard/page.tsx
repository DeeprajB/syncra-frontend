import { Folder, Plus, UserPlus } from "lucide-react"

import { FlashToast } from "@/components/flash-toast"
import { Button } from "@/components/ui/button"
import { syncSyncraUser } from "@/lib/api"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error) ? params.error[0] : params.error

  let syncError = callbackError

  try {
    await syncSyncraUser()
  } catch (error) {
    syncError = error instanceof Error ? error.message : "Failed to sync user"
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      {syncError ? (
        <FlashToast
          type="error"
          title="User sync failed"
          description={syncError}
          clearErrorParam
        />
      ) : null}

      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
          <Folder className="size-5" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold tracking-[-0.025em] text-[#0F172A]">
          Welcome to Syncra
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#64748B] text-pretty">
          Create or join a workspace to start collaborating with your team.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]">
            <Plus className="size-4" />
            Create workspace
          </Button>
          <Button
            variant="outline"
            className="h-9 border-[#E2E8F0] bg-white px-3 font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            <UserPlus className="size-4" />
            Join a workspace
          </Button>
        </div>
      </div>
    </main>
  )
}
