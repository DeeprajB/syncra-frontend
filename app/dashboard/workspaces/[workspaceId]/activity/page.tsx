import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { listProjects, listWorkspaceActivity } from "@/lib/api"

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const [activity, listed] = await Promise.all([
    listWorkspaceActivity(workspaceId),
    listProjects(workspaceId),
  ])

  return (
    <main className="flex flex-1 flex-col px-6 py-8 lg:px-8">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A]">
        Activity
      </h1>
      <ActivityFeed
        workspaceId={workspaceId}
        initial={
          activity.ok
            ? {
                available: activity.available,
                items: activity.items,
                nextCursor: activity.nextCursor,
              }
            : undefined
        }
        projects={
          listed.ok
            ? listed.projects.map((project) => ({
                id: project.id,
                title: project.title,
              }))
            : []
        }
      />
    </main>
  )
}
