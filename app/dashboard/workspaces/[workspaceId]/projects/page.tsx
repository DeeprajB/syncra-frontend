import { Folder } from "lucide-react"

import { CreateProjectButton } from "@/components/dashboard/create-project-button"

export default function ProjectsPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
        Projects
      </h1>
      <div className="mt-6 flex flex-col items-center rounded-2xl bg-[#F4F6FB] px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
          <Folder className="size-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-[#0F172A]">
          No projects yet
        </h2>
        <p className="mt-1 max-w-xs text-sm leading-6 text-[#64748B]">
          Create your first project to start organizing your team&apos;s work.
        </p>
        <div className="mt-5">
          <CreateProjectButton />
        </div>
      </div>
    </main>
  )
}
