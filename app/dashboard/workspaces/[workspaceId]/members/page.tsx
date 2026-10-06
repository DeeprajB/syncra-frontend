import { MemberRow } from "@/components/dashboard/member-row"
import { listWorkspaceMembers, personalizeMembers } from "@/lib/api"

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const membersResult = await listWorkspaceMembers(workspaceId)
  const members = membersResult.ok
    ? await personalizeMembers(membersResult.members)
    : []

  return (
    <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
        Members
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        {membersResult.ok
          ? `${members.length} ${members.length === 1 ? "member" : "members"}`
          : membersResult.message}
      </p>
      <ul className="mt-6 flex max-w-xl flex-col gap-2">
        {members.map((member) => (
          <li key={member.id}>
            <MemberRow member={member} />
          </li>
        ))}
      </ul>
    </main>
  )
}
