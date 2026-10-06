import { JoinWorkspaceDialog } from "@/components/dashboard/join-workspace-dialog"
import { WorkspaceScreen } from "@/components/dashboard/workspace-screen"
import {
  getWorkspace,
  listWorkspaceMembers,
  personalizeMembers,
} from "@/lib/api"

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

  return (
    <>
      {invite ? (
        <JoinWorkspaceDialog defaultInvite={invite} defaultOpen hideTrigger />
      ) : null}
      <WorkspaceScreen
        workspace={workspaceResult.workspace}
        members={members}
        membersError={membersResult.ok ? undefined : membersResult.message}
      />
    </>
  )
}
