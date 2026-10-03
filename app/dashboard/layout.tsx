import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { syncSyncraUser } from "@/lib/api"
import { auth0 } from "@/lib/auth0"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth0.getSession()

  if (!session) {
    redirect("/auth/login?returnTo=/dashboard")
  }

  let picture: string | undefined

  try {
    const user = await syncSyncraUser()
    picture = user.picture || undefined
  } catch {
    picture = undefined
  }

  return (
    <DashboardShell
      name={session.user.name}
      email={session.user.email}
      picture={picture}
    >
      {children}
    </DashboardShell>
  )
}
