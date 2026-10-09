import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Request header carrying the access token from middleware into this render. */
export const BACKEND_ACCESS_TOKEN_HEADER = "x-syncra-access-token"

/** Request header carrying the path to return to after a fresh login. */
export const LOGIN_RETURN_TO_HEADER = "x-syncra-return-to"

export const auth0 = new Auth0Client({
  signInReturnToPath: "/dashboard",
  // Refresh slightly early so a request does not arrive at the API already expired.
  tokenRefreshBuffer: 120,
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    // offline_access is what makes Auth0 issue a refresh token. Without it, the
    // session cookie outlives the access token and the backend stops accepting calls.
    scope: "openid profile email offline_access",
  },
  async onCallback(error, ctx, session) {
    const appBaseUrl = ctx.appBaseUrl
    if (!appBaseUrl) {
      throw new Error(
        "appBaseUrl could not be resolved for the callback redirect."
      )
    }

    if (error) {
      const url = new URL("/", appBaseUrl)
      url.searchParams.set("error", error.message)
      return NextResponse.redirect(url)
    }

    const accessToken = session?.tokenSet?.accessToken
    if (accessToken && API_URL) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        })

        if (!response.ok) {
          const detail = await response.text()
          const url = new URL("/", appBaseUrl)
          url.searchParams.set(
            "error",
            `Failed to sync user: ${response.status} ${detail}`
          )
          return NextResponse.redirect(url)
        }
      } catch (syncError) {
        const url = new URL("/", appBaseUrl)
        url.searchParams.set(
          "error",
          syncError instanceof Error ? syncError.message : "Failed to sync user"
        )
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.redirect(new URL(ctx.returnTo || "/", appBaseUrl))
  },
})
