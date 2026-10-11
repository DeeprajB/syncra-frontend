"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import Link from "next/link"

import { loadWorkspaceActivity } from "@/app/dashboard/activity-actions"
import { PersonAvatar } from "@/components/dashboard/person-avatar"
import { Button } from "@/components/ui/button"
import type { WorkspaceActivity } from "@/lib/activity"
import { activityKeys } from "@/lib/query"

type ActivityPage = {
  available: boolean
  items: WorkspaceActivity[]
  nextCursor: string | null
}

export function ActivityFeed({
  workspaceId,
  initial,
  projects,
}: {
  workspaceId: string
  initial?: ActivityPage
  projects: { id: string; title: string }[]
}) {
  const activity = useInfiniteQuery({
    queryKey: activityKeys.workspace(workspaceId),
    queryFn: ({ pageParam }) => loadWorkspaceActivity(workspaceId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
    initialData: initial ? { pages: [initial], pageParams: [null] } : undefined,
  })
  const pages = activity.data?.pages ?? []
  const available = pages.every((page) => page.available)
  const items = pages.flatMap((page) => page.items)
  const projectsById = new Map(projects.map((project) => [project.id, project]))

  if (activity.isPending) {
    return <p className="mt-6 text-sm text-[#64748B]">Loading activity…</p>
  }
  if (activity.isError && items.length === 0) {
    return (
      <div className="mt-6 flex items-center gap-3 text-sm text-[#64748B]">
        <p>Couldn&apos;t load activity.</p>
        <Button
          type="button"
          variant="outline"
          className="h-8 bg-white"
          onClick={() => activity.refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }
  if (!available) {
    return (
      <p className="mt-2 text-sm text-[#64748B]">
        Activity isn&apos;t available yet.
      </p>
    )
  }
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-[#64748B]">No activity yet.</p>
  }

  const groups = groupByDay(items)

  return (
    <div className="mt-6 flex max-w-2xl flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            {group.label}
          </h2>
          <ol className="mt-3 flex flex-col">
            {group.items.map((item, index) => {
              const project = item.projectId
                ? projectsById.get(item.projectId)
                : undefined
              return (
                <li
                  key={item.id}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  {index < group.items.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-2 bottom-0 left-[13px] w-px bg-[#E2E8F0]"
                    />
                  ) : null}
                  <PersonAvatar
                    name={item.actorName}
                    avatarUrl={item.avatarUrl}
                    className="relative z-10 size-7 ring-2 ring-white"
                  />
                  <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                    <p className="text-sm leading-5 text-[#0F172A]">
                      <span className="font-medium">{item.actorName}</span>{" "}
                      {item.summary}
                      {project ? (
                        <>
                          {" "}
                          in{" "}
                          <Link
                            href={`/dashboard/workspaces/${workspaceId}/projects/${project.id}`}
                            className="font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                          >
                            {project.title}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="shrink-0 text-xs text-[#94A3B8]"
                    >
                      {formatEventTime(item.createdAt)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
      {activity.hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          className="h-8 w-fit bg-white"
          disabled={activity.isFetchingNextPage}
          onClick={() => activity.fetchNextPage()}
        >
          {activity.isFetchingNextPage ? "Loading…" : "Load earlier"}
        </Button>
      ) : null}
    </div>
  )
}

function groupByDay(items: WorkspaceActivity[]) {
  const groups: { label: string; items: WorkspaceActivity[] }[] = []
  for (const item of items) {
    const label = dayLabel(item.createdAt)
    const current = groups[groups.length - 1]
    if (current?.label === label) {
      current.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }
  return groups
}

function dayLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Earlier"
  }
  const now = new Date()
  if (sameDay(date, now)) {
    return "Today"
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(date, yesterday)) {
    return "Yesterday"
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  })
}

function formatEventTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}
