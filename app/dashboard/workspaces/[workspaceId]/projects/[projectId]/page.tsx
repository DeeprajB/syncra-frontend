import Link from "next/link"

import { ProjectDetailActions } from "@/components/dashboard/project-detail-actions"
import { buttonVariants } from "@/components/ui/button"
import {
  currentMember,
  getProject,
  getWorkspace,
  listWorkspaceMembers,
} from "@/lib/api"
import { canManageProject, projectStatusLabel } from "@/lib/projects"
import { cn } from "@/lib/utils"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const workspaceResult = await getWorkspace(workspaceId)
  if (!workspaceResult.ok) {
    return null
  }

  const projectResult = await getProject(projectId)
  if (!projectResult.ok || projectResult.project.workspaceId !== workspaceId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
          This project is no longer available
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
          It may have been archived, or you no longer have access to it.
        </p>
        <Link
          href={`/dashboard/workspaces/${workspaceId}/projects`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
          )}
        >
          Back to projects
        </Link>
      </main>
    )
  }

  const project = projectResult.project
  const membersResult = await listWorkspaceMembers(workspaceId)
  const actor = await currentMember(
    membersResult.ok ? membersResult.members : []
  )

  return (
    <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">
            <Link
              href={`/dashboard/workspaces/${workspaceId}/projects`}
              className="hover:text-[#0F172A]"
            >
              Projects
            </Link>
          </p>
          <h1 className="mt-2 font-heading text-[1.75rem] leading-9 font-bold tracking-[-0.025em] text-[#0F172A]">
            {project.title}
          </h1>
          {project.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
              {project.description}
            </p>
          ) : null}
        </div>
        {canManageProject(actor?.role) ? (
          <ProjectDetailActions
            workspaceId={workspaceId}
            workspaceTitle={workspaceResult.workspace.title}
            project={project}
          />
        ) : null}
      </div>
      <dl className="mt-8 grid max-w-xl gap-4 text-sm">
        <div>
          <dt className="font-medium text-[#0F172A]">Status</dt>
          <dd className="mt-1 text-[#64748B]">
            {projectStatusLabel(project.status)}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[#0F172A]">Start date</dt>
          <dd className="mt-1 text-[#64748B]">
            {project.startDate ?? "Not set"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[#0F172A]">Due date</dt>
          <dd className="mt-1 text-[#64748B]">
            {project.dueDate ?? "Not set"}
          </dd>
        </div>
      </dl>
    </main>
  )
}
