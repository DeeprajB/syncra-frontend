import { WorkspaceUnavailable } from "@/components/dashboard/workspace-unavailable"
import { getWorkspace } from "@/lib/api"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const workspaceResult = await getWorkspace(workspaceId)

  if (
    !workspaceResult.ok &&
    (workspaceResult.status === 404 || workspaceResult.status === 403)
  ) {
    return <WorkspaceUnavailable />
  }

  if (!workspaceResult.ok) {
    return (
      <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
          Couldn&apos;t load this workspace
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">Try again in a moment.</p>
      </main>
    )
  }

  return children
}
