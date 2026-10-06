import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { auth0 } from "./lib/auth0"

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/auth") || authResponse.status !== 200) {
    return authResponse
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/invite")) {
    const session = await auth0.getSession(request)

    if (!session) {
      const returnTo = `${pathname}${request.nextUrl.search}`
      const loginUrl = new URL("/auth/login", request.nextUrl.origin)
      loginUrl.searchParams.set("returnTo", returnTo)
      return NextResponse.redirect(loginUrl)
    }
  }

  return authResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
