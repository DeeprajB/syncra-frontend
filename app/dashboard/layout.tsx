import { redirect } from "next/navigation"

import { SiteHeader } from "@/components/site-header"
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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
        {children}
      </div>
    </div>
  )
}
