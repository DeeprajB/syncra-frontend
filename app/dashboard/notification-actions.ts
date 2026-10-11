"use server"

import { syncraFetch } from "@/lib/api"
import {
  readNotificationPage,
  type InboxNotification,
} from "@/lib/notifications"

export async function loadNotifications(cursor?: string): Promise<{
  items: InboxNotification[]
  nextCursor: string | null
}> {
  const params = new URLSearchParams({ limit: "20" })
  if (cursor) {
    params.set("cursor", cursor)
  }
  const result = await syncraFetch(`/api/v1/notifications?${params.toString()}`)
  if (!result.ok) {
    throw new Error("Couldn't load notifications.")
  }
  const page = readNotificationPage(result.body)
  if (!page) {
    throw new Error("Couldn't load notifications.")
  }
  return page
}

export async function loadUnreadCount() {
  const result = await syncraFetch("/api/v1/notifications/unread-count")
  if (!result.ok || !result.body || typeof result.body !== "object") {
    return 0
  }
  const count = (result.body as { count?: unknown }).count
  return typeof count === "number" ? count : 0
}

export async function markNotificationRead(notificationId: string) {
  await syncraFetch(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" }
  )
}

export async function markAllNotificationsRead() {
  await syncraFetch("/api/v1/notifications/read-all", { method: "POST" })
}
