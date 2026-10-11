"use client"

import { useState } from "react"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  loadNotifications,
  loadUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/dashboard/notification-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationKeys } from "@/lib/query"
import type { InboxNotification } from "@/lib/notifications"

function formatWhen(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function NotificationButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const unread = useQuery({
    queryKey: notificationKeys.unread,
    queryFn: loadUnreadCount,
  })
  const inbox = useInfiniteQuery({
    queryKey: notificationKeys.list,
    queryFn: ({ pageParam }) => loadNotifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: open,
  })
  const items = inbox.data?.pages.flatMap((page) => page.items) ?? []
  const count = unread.data ?? 0

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  }

  async function openItem(item: InboxNotification) {
    if (!item.readAt) {
      await markNotificationRead(item.id)
      await refresh()
    }
    setOpen(false)
    router.push(
      `/dashboard/workspaces/${item.workspaceId}/projects/${item.projectId}?task=${encodeURIComponent(item.taskId)}`
    )
  }

  async function markAll() {
    await markAllNotificationsRead()
    await refresh()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
        className="relative flex size-9 items-center justify-center rounded-full text-[#475569] outline-none hover:bg-[#F1F5F9] focus-visible:ring-3 focus-visible:ring-[#3B82F6]/40"
      >
        <Bell className="size-4" />
        {count > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3B82F6] px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-3 py-2">
          <p className="text-sm font-semibold text-[#0F172A]">Notifications</p>
          {count > 0 ? (
            <button
              type="button"
              className="text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB]"
              onClick={() => {
                void markAll()
              }}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="max-h-96 overflow-y-auto p-1">
          {inbox.isPending ? (
            <p className="px-2 py-6 text-center text-sm text-[#64748B]">Loading…</p>
          ) : inbox.isError ? (
            <p className="px-2 py-6 text-center text-sm text-[#64748B]">
              Couldn&apos;t load notifications.
            </p>
          ) : items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[#64748B]">
              No new notifications
            </p>
          ) : (
            items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={`items-start px-2 py-2 ${item.readAt ? "" : "bg-[#F8FAFC]"}`}
                onClick={() => {
                  void openItem(item)
                }}
              >
                {item.readAt ? (
                  <span className="mt-1.5 size-1.5 shrink-0" />
                ) : (
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#0F172A]">
                    {item.title}
                  </span>
                  {item.body ? (
                    <span className="mt-0.5 block truncate text-xs text-[#64748B]">
                      {item.body}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-[11px] text-[#94A3B8]">
                    {formatWhen(item.createdAt)}
                  </span>
                </span>
              </DropdownMenuItem>
            ))
          )}
          {inbox.hasNextPage ? (
            <button
              type="button"
              className="w-full px-2 py-2 text-center text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB]"
              onClick={() => {
                void inbox.fetchNextPage()
              }}
            >
              Load more
            </button>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
