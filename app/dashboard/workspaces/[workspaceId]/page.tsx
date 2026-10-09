import { JoinWorkspaceDialog } from "@/components/dashboard/join-workspace-dialog"
import { WorkspaceScreen } from "@/components/dashboard/workspace-screen"
import {
  currentMember,
  getWorkspace,
  listProjects,
  listWorkspaceMembers,
  personalizeMembers,
} from "@/lib/api"
import { canCreateProject, canManageProject } from "@/lib/projects"

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>
  searchParams: Promise<{ invite?: string | string[] }>
}) {
  const { workspaceId } = await params
  const query = await searchParams
  const invite = Array.isArray(query.invite) ? query.invite[0] : query.invite
  const workspaceResult = await getWorkspace(workspaceId)

  if (!workspaceResult.ok) {
    return null
  }

  const membersResult = await listWorkspaceMembers(workspaceId)
  const members = membersResult.ok
    ? await personalizeMembers(membersResult.members)
    : []
  const [listed, actor] = await Promise.all([
    listProjects(workspaceId),
    currentMember(members),
  ])

  return (
    <>
      {invite ? (
        <JoinWorkspaceDialog defaultInvite={invite} defaultOpen hideTrigger />
      ) : null}
      <WorkspaceScreen
        workspace={workspaceResult.workspace}
        members={members}
        membersError={membersResult.ok ? undefined : membersResult.message}
        projects={listed.ok ? listed.projects : []}
        projectsError={listed.ok ? undefined : listed.message}
        canCreateProject={canCreateProject(actor?.role)}
        canManageProject={canManageProject(actor?.role)}
      />
    </>
  )
}
