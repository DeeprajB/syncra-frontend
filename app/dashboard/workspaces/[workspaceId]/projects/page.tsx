import { ProjectBoard } from "@/components/dashboard/project-board"
import {
  currentMember,
  getWorkspace,
  listProjects,
  listWorkspaceMembers,
} from "@/lib/api"
import { canCreateProject, canManageProject } from "@/lib/projects"

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const workspaceResult = await getWorkspace(workspaceId)
  if (!workspaceResult.ok) {
    return null
  }

  const [listed, membersResult] = await Promise.all([
    listProjects(workspaceId),
    listWorkspaceMembers(workspaceId),
  ])
  const actor = await currentMember(
    membersResult.ok ? membersResult.members : []
  )

  return (
    <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
      <ProjectBoard
        variant="page"
        workspaceId={workspaceId}
        workspaceTitle={workspaceResult.workspace.title}
        projects={listed.ok ? listed.projects : []}
        error={listed.ok ? undefined : listed.message}
        canCreate={canCreateProject(actor?.role)}
        canManage={canManageProject(actor?.role)}
      />
    </main>
  )
}
