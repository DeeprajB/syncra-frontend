import { redirect } from "next/navigation"

import { listWorkspaces } from "@/lib/api"

export default async function SettingsPage() {
  const listed = await listWorkspaces()
  if (listed.ok && listed.workspaces[0]) {
    redirect(`/dashboard/workspaces/${listed.workspaces[0].id}/settings`)
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
        Settings
      </h1>
      <p className="mt-2 text-sm text-[#64748B]">
        Account settings will live here.
      </p>
    </main>
  )
}
