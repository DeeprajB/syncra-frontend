import { Mail, UserRound } from "lucide-react"

import { FlashToast } from "@/components/flash-toast"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { syncSyncraUser } from "@/lib/api"
import { auth0 } from "@/lib/auth0"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error) ? params.error[0] : params.error
  const session = await auth0.getSession()

  let user
  let syncError = callbackError

  try {
    user = await syncSyncraUser()
  } catch (error) {
    syncError = error instanceof Error ? error.message : "Failed to sync user"
  }

  const displayName =
    user?.email || user?.sub || session?.user?.email || session?.user?.sub

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary">Protected</Badge>
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Signed in as {displayName || "your Syncra account"}.
        </p>
      </div>

      {syncError ? (
        <FlashToast
          type="error"
          title="User sync failed"
          description={syncError}
          clearErrorParam
        />
      ) : (
        <FlashToast
          type="success"
          title="Account synced"
          description="Auth0 and the Syncra backend agree on this session."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Identity from Auth0 after a successful `/auth/me` sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UserRound className="size-4 text-muted-foreground" />
            <span>{user?.sub || session?.user?.sub || "Unknown subject"}</span>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" />
            <span>{user?.email || session?.user?.email || "No email on file"}</span>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
