import { syncSyncraUser } from "@/lib/api"
import { auth0 } from "@/lib/auth0"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error) ? params.error[0] : params.error
  const session = await auth0.getSession()

  if (!session) {
    return (
      <main>
        {callbackError ? <p>{callbackError}</p> : null}
        <a href="/auth/login">Log in</a>
      </main>
    )
  }

  let user
  let syncError = callbackError

  try {
    user = await syncSyncraUser()
  } catch (error) {
    syncError = error instanceof Error ? error.message : "Failed to sync user"
  }

  return (
    <main>
      {syncError ? <p>{syncError}</p> : null}
      {user ? (
        <>
          <p>Signed in as {user.email || user.sub}</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      ) : (
        <p>Logged in to Auth0, but the backend user was not synced.</p>
      )}
      <a href="/auth/logout">Log out</a>
    </main>
  )
}
