import { auth0 } from "@/lib/auth0"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function syncSyncraUser(accessToken?: string) {
  const token =
    accessToken ??
    (
      await auth0.getAccessToken({
        audience: process.env.AUTH0_AUDIENCE,
      })
    ).token

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Failed to sync user: ${response.status} ${detail}`)
  }

  return response.json()
}
