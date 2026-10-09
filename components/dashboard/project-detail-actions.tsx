"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ArchiveProjectDialog } from "@/components/dashboard/project-board"
import { ProjectFormDialog } from "@/components/dashboard/project-form-dialog"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/projects"

export function ProjectDetailActions({
  workspaceId,
  workspaceTitle,
  project,
}: {
  workspaceId: string
  workspaceTitle: string
  project: Project
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-9 bg-white px-3 font-semibold"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 border-[#FECACA] bg-white px-3 font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
        onClick={() => setArchiveOpen(true)}
      >
        Archive
      </Button>
      <ProjectFormDialog
        mode="edit"
        workspaceId={workspaceId}
        workspaceTitle={workspaceTitle}
        project={project}
        hideTrigger
        open={editing}
        onOpenChange={setEditing}
      />
      <ArchiveProjectDialog
        project={project}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onArchived={() =>
          router.push(`/dashboard/workspaces/${workspaceId}/projects`)
        }
      />
    </div>
  )
}
