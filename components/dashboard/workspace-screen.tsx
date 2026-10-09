import { ProjectBoard } from "@/components/dashboard/project-board"
import { InviteMembersButton } from "@/components/dashboard/invite-members-button"
import { MemberRow } from "@/components/dashboard/member-row"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/projects"
import type { Workspace, WorkspaceMember } from "@/lib/workspaces"

export function WorkspaceScreen({
  workspace,
  members,
  membersError,
  projects,
  projectsError,
  canCreateProject,
  canManageProject,
}: {
  workspace: Workspace
  members: WorkspaceMember[]
  membersError?: string
  projects: Project[]
  projectsError?: string
  canCreateProject: boolean
  canManageProject: boolean
}) {
  const memberCount = members.length
  const memberLabel = `${memberCount} ${memberCount === 1 ? "member" : "members"}`

  return (
    <div className="@container flex flex-1 flex-col px-6 py-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-[1.75rem] leading-9 font-bold tracking-[-0.025em] text-[#0F172A]">
              {workspace.title}
            </h1>
            {workspace.description ? (
              <p className="mt-1 text-sm text-[#64748B]">
                {workspace.description}
              </p>
            ) : null}
          </div>
        </div>
        <InviteMembersButton workspaceId={workspace.id} />
      </div>

      <div className="mt-8 grid items-start gap-8 @min-[640px]:grid-cols-[minmax(0,1fr)_18.5rem]">
        <section>
          <ProjectBoard
            variant="section"
            workspaceId={workspace.id}
            workspaceTitle={workspace.title}
            projects={projects}
            error={projectsError}
            canCreate={canCreateProject}
            canManage={canManageProject}
          />
        </section>

        <aside>
          <div className="flex h-8 items-center gap-2">
            <h2 className="text-sm font-semibold text-[#0F172A]">Team</h2>
            <Badge
              variant="outline"
              className="h-5 rounded-full border-[#E2E8F0] bg-[#F8FAFC] px-2 text-[11px] font-semibold text-[#64748B]"
            >
              {membersError ? "—" : memberLabel}
            </Badge>
          </div>
          {membersError ? (
            <p className="mt-3 text-sm text-[#64748B]">{membersError}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {members.map((member) => (
                <li key={member.id}>
                  <MemberRow member={member} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
