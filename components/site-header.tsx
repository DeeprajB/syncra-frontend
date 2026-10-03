import Link from "next/link"
import { LayoutDashboard, LogIn, LogOut } from "lucide-react"

import { SyncraMark } from "@/components/syncra-mark"
import { buttonVariants } from "@/components/ui/button"
import { auth0 } from "@/lib/auth0"

export async function SiteHeader() {
  const session = await auth0.getSession()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-base font-medium">
          <SyncraMark className="size-6" />
          Syncra
        </Link>
        <nav className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost" })}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <a
                href="/auth/logout"
                className={buttonVariants({ variant: "outline" })}
              >
                <LogOut className="size-4" />
                Log out
              </a>
            </>
          ) : (
            <>
              <a
                href="/auth/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                <LogIn className="size-4" />
                Log in
              </a>
              <a
                href="/auth/login?screen_hint=signup"
                className={buttonVariants()}
              >
                Sign up
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
