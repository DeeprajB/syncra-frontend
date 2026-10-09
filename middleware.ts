import {
  AccessTokenError,
  AccessTokenErrorCode,
} from "@auth0/nextjs-auth0/errors"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  auth0,
  BACKEND_ACCESS_TOKEN_HEADER,
  LOGIN_RETURN_TO_HEADER,
} from "./lib/auth0"

const REAUTH_CODES = new Set<string>([
  AccessTokenErrorCode.MISSING_SESSION,
  AccessTokenErrorCode.MISSING_REFRESH_TOKEN,
  AccessTokenErrorCode.FAILED_TO_REFRESH_TOKEN,
  AccessTokenErrorCode.SESSION_EXPIRED,
])

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/auth") || authResponse.status !== 200) {
    return authResponse
  }

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/invite")) {
    return authResponse
  }

  const session = await auth0.getSession(request)
  if (!session) {
    return loginRedirect(request)
  }

  let token: string | undefined
  try {
    token = (
      await auth0.getAccessToken(request, authResponse, {
        audience: process.env.AUTH0_AUDIENCE,
      })
    ).token
  } catch (error) {
    if (needsReauthentication(error)) {
      return loginRedirect(request)
    }
  }

  // Persist a refreshed token on the response, and hand the same token to this
  // render so server components do not rotate the refresh token a second time.
  applyUpstreamHeaders(authResponse, request, {
    [BACKEND_ACCESS_TOKEN_HEADER]: token ?? null,
    [LOGIN_RETURN_TO_HEADER]: `${pathname}${request.nextUrl.search}`,
  })

  return authResponse
}

function loginRedirect(request: NextRequest) {
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const loginUrl = new URL("/auth/login", request.nextUrl.origin)
  loginUrl.searchParams.set("returnTo", returnTo)
  return NextResponse.redirect(loginUrl)
}

function needsReauthentication(error: unknown) {
  return error instanceof AccessTokenError && REAUTH_CODES.has(error.code)
}

function applyUpstreamHeaders(
  response: NextResponse,
  request: NextRequest,
  extras: Record<string, string | null>
) {
  const headers = new Headers(request.headers)
  for (const [name, value] of Object.entries(extras)) {
    if (value) {
      headers.set(name, value)
    } else {
      headers.delete(name)
    }
  }

  const keys: string[] = []
  for (const [key, value] of headers) {
    response.headers.set(`x-middleware-request-${key}`, value)
    keys.push(key)
  }
  response.headers.set("x-middleware-override-headers", keys.join(","))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
