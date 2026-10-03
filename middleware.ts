import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { auth0 } from "./lib/auth0"

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/auth") || authResponse.status !== 200) {
    return authResponse
  }

  if (pathname.startsWith("/dashboard")) {
    const session = await auth0.getSession(request)

    if (!session) {
      return NextResponse.redirect(
        new URL("/auth/login?returnTo=/dashboard", request.nextUrl.origin)
      )
    }
  }

  return authResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
