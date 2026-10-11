import Link from "next/link"

import { TaskBoard } from "@/components/dashboard/task-board"
import { buttonVariants } from "@/components/ui/button"
import {
  currentMember,
  getProject,
  getWorkspace,
  listProjectTasks,
  listWorkspaceMembers,
} from "@/lib/api"
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

  const membersResult = await listWorkspaceMembers(workspaceId)
  const members = membersResult.ok ? membersResult.members : []
  const actor = await currentMember(members)
  const tasksResult = await listProjectTasks(projectId)

  return (
    <TaskBoard
      workspaceId={workspaceId}
      workspaceTitle={workspaceResult.workspace.title}
      project={projectResult.project}
      tasks={tasksResult.ok ? tasksResult.tasks : []}
      tasksError={tasksResult.ok ? undefined : tasksResult.message}
      members={members}
      actorId={actor?.userId}
      role={actor?.role}
    />
  )
}
