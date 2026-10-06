import { WorkspaceSettings } from "@/components/dashboard/workspace-settings"
import {
  getWorkspace,
  listWorkspaceMembers,
  personalizeMembers,
  syncSyncraUser,
} from "@/lib/api"
import { auth0 } from "@/lib/auth0"
import { findCurrentMember } from "@/lib/workspaces"

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const workspaceResult = await getWorkspace(workspaceId)

  if (!workspaceResult.ok) {
    return null
  }

  const membersResult = await listWorkspaceMembers(workspaceId)
  const members = membersResult.ok
    ? await personalizeMembers(membersResult.members)
    : []
  let profileId: string | undefined
  try {
    profileId = (await syncSyncraUser()).id
  } catch {
    profileId = undefined
  }
  const session = await auth0.getSession()
  const currentMember = findCurrentMember(members, {
    id: profileId,
    email: session?.user.email,
  })

  return (
    <WorkspaceSettings
      workspace={workspaceResult.workspace}
      members={members}
      membersError={membersResult.ok ? undefined : membersResult.message}
      currentRole={currentMember?.role}
      currentUserId={currentMember?.userId}
    />
  )
}
