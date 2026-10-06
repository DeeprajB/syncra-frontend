import Link from "next/link"
import { Archive } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WorkspaceUnavailable() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
        <Archive className="size-5" />
      </div>
      <h1 className="mt-4 font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
        This workspace is no longer available
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
        The owner may have archived it, or you no longer have access. You can
        open another workspace, or create a new one.
      </p>
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
        )}
      >
        Go to your workspaces
      </Link>
    </main>
  )
}
