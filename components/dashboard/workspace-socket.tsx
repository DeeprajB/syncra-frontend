"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { issueWorkspaceTicket } from "@/app/dashboard/realtime-actions"
import { PersonAvatar } from "@/components/dashboard/person-avatar"
import { activityKeys, commentKeys, presenceKeys, taskKeys } from "@/lib/query"
import {
  applyCursors,
  applyPresence,
  bindCursorSync,
  bindWatchSync,
  cursorTarget,
  isDomainEvent,
  readEnvelope,
  watchedTask,
  workspaceSocketUrl,
  type PresenceCursor,
  type PresenceMember,
} from "@/lib/realtime"

type ConnectionState = "connecting" | "live" | "offline"

export function WorkspaceSocket({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [connection, setConnection] = useState<ConnectionState>("connecting")
  const refreshTimer = useRef<number | null>(null)
  const watched = useRef<string | null>(null)
  const sentCursor = useRef<string | null>(null)

  const presence = useQuery({
    queryKey: presenceKeys.members(workspaceId),
    queryFn: async () => [] as PresenceMember[],
    initialData: [] as PresenceMember[],
    staleTime: Infinity,
    enabled: false,
  })
  const self = useQuery({
    queryKey: presenceKeys.self(workspaceId),
    queryFn: async () => null as string | null,
    initialData: null as string | null,
    staleTime: Infinity,
    enabled: false,
  })

  useEffect(() => {
    let stopped = false
    let socket: WebSocket | null = null
    let attempt = 0
    let timer = 0
    let openedBefore = false
    let connecting = false
    watched.current = null
    sentCursor.current = null

    function syncWatch() {
      const ws = socket
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return
      }
      const next = watchedTask(workspaceId)
      const previous = watched.current
      if (next === previous) {
        return
      }
      if (previous) {
        ws.send(
          JSON.stringify({
            type: "task.stopped_viewing",
            task_id: previous,
          })
        )
      }
      if (next) {
        ws.send(JSON.stringify({ type: "task.viewing", task_id: next }))
      }
      watched.current = next
    }

    function syncCursor() {
      const ws = socket
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return
      }
      const next = cursorTarget(workspaceId)
      const key = next
        ? `${next.projectId}|${next.taskId ?? ""}|${next.column ?? ""}`
        : ""
      if (key === sentCursor.current) {
        return
      }
      ws.send(
        JSON.stringify({
          type: "presence.cursor",
          project_id: next?.projectId ?? null,
          task_id: next?.taskId ?? null,
          column: next?.column ?? null,
        })
      )
      sentCursor.current = key
    }

    function scheduleRefresh() {
      if (refreshTimer.current !== null) {
        return
      }
      refreshTimer.current = window.setTimeout(() => {
        refreshTimer.current = null
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        queryClient.invalidateQueries({ queryKey: ["task-activity"] })
        queryClient.invalidateQueries({ queryKey: ["task-comments"] })
        queryClient.invalidateQueries({
          queryKey: activityKeys.workspace(workspaceId),
        })
      }, 250)
    }

    function publishPresence(members: PresenceMember[]) {
      queryClient.setQueryData(presenceKeys.members(workspaceId), members)
    }

    function publishCursors(cursors: PresenceCursor[]) {
      queryClient.setQueryData(presenceKeys.cursors(workspaceId), cursors)
    }

    function handleEvent(raw: unknown) {
      const event = readEnvelope(raw)
      if (!event || event.workspaceId !== workspaceId) {
        return
      }
      if (event.type === "connection.ready") {
        attempt = 0
        setConnection("live")
        const userId = event.data.user_id
        if (typeof userId === "string") {
          queryClient.setQueryData(presenceKeys.self(workspaceId), userId)
        }
        if (openedBefore) {
          scheduleRefresh()
          router.refresh()
        }
        openedBefore = true
        syncWatch()
        syncCursor()
        return
      }
      if (event.type === "connection.ping") {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "presence.ping" }))
        }
        return
      }
      const nextPresence = applyPresence(
        queryClient.getQueryData<PresenceMember[]>(
          presenceKeys.members(workspaceId)
        ) ?? [],
        event
      )
      if (nextPresence) {
        publishPresence(nextPresence)
      }
      const nextCursors = applyCursors(
        queryClient.getQueryData<PresenceCursor[]>(
          presenceKeys.cursors(workspaceId)
        ) ?? [],
        event
      )
      if (nextCursors) {
        publishCursors(nextCursors)
      }
      if (nextPresence || nextCursors) {
        return
      }
      if (event.type === "notification.created") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        return
      }
      if (!isDomainEvent(event.type)) {
        return
      }
      if (event.projectId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.list(event.projectId),
        })
      }
      if (event.taskId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.activity(event.taskId),
        })
        queryClient.invalidateQueries({
          queryKey: commentKeys.list(event.taskId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: activityKeys.workspace(workspaceId),
      })
      if (event.type === "member.joined" || event.type === "member.left") {
        router.refresh()
      }
    }

    async function connect() {
      if (stopped || connecting) {
        return
      }
      connecting = true
      setConnection("connecting")
      const issued = await issueWorkspaceTicket(workspaceId).catch(() => null)
      connecting = false
      if (stopped) {
        return
      }
      if (!issued?.ok) {
        setConnection("offline")
        const status = issued?.status ?? 0
        const delay =
          status === 401 || status === 403 || status === 404
            ? 30_000
            : Math.min(1000 * 2 ** Math.min(attempt, 4), 15_000)
        attempt += 1
        timer = window.setTimeout(connect, delay)
        return
      }
      const url = workspaceSocketUrl(workspaceId)
      if (!url) {
        setConnection("offline")
        return
      }
      let ticket = issued.ticket
      const ws = new WebSocket(url)
      socket = ws
      ws.onopen = () => {
        if (stopped || !ticket) {
          ws.close()
          return
        }
        ws.send(JSON.stringify({ type: "connection.auth", ticket }))
        ticket = ""
      }
      ws.onmessage = (message) => {
        if (typeof message.data !== "string") {
          return
        }
        try {
          handleEvent(JSON.parse(message.data))
        } catch {
          return
        }
      }
      ws.onclose = () => {
        if (socket === ws) {
          socket = null
        }
        watched.current = null
        sentCursor.current = null
        publishPresence([])
        publishCursors([])
        if (stopped) {
          return
        }
        setConnection("offline")
        const delay = Math.min(1000 * 2 ** Math.min(attempt, 4), 15_000)
        attempt += 1
        timer = window.setTimeout(connect, delay)
      }
    }

    const unbind = bindWatchSync(workspaceId, syncWatch)
    const unbindCursor = bindCursorSync(workspaceId, syncCursor)
    void connect()

    function wake() {
      if (document.visibilityState === "hidden") {
        return
      }
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        window.clearTimeout(timer)
        attempt = 0
        void connect()
      }
    }

    document.addEventListener("visibilitychange", wake)
    window.addEventListener("online", wake)

    return () => {
      stopped = true
      unbind()
      unbindCursor()
      window.clearTimeout(timer)
      if (refreshTimer.current !== null) {
        window.clearTimeout(refreshTimer.current)
        refreshTimer.current = null
      }
      document.removeEventListener("visibilitychange", wake)
      window.removeEventListener("online", wake)
      socket?.close()
      queryClient.setQueryData(presenceKeys.members(workspaceId), [])
      queryClient.setQueryData(presenceKeys.cursors(workspaceId), [])
    }
  }, [queryClient, router, workspaceId])

  const others = (presence.data ?? []).filter(
    (member) => member.userId !== self.data
  )
  const label =
    connection === "live"
      ? "Live"
      : connection === "connecting"
        ? "Connecting"
        : "Offline"
  const dot =
    connection === "live"
      ? "bg-[#06B6D4]"
      : connection === "connecting"
        ? "animate-pulse bg-[#F59E0B]"
        : "bg-[#94A3B8]"

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white py-1 pr-1.5 pl-2.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.45)]">
      <span className={`size-2 rounded-full ${dot}`} />
      <span className="text-xs font-medium text-[#475569]">{label}</span>
      {others.length > 0 ? (
        <span className="flex -space-x-1.5">
          {others.slice(0, 4).map((member) => (
            <PersonAvatar
              key={member.userId}
              name={member.name}
              avatarUrl={member.avatarUrl}
              className="size-6 ring-2 ring-[#06B6D4]"
              title={member.name}
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}

export function useTaskViewers(workspaceId: string, taskId: string) {
  const presence = useQuery({
    queryKey: presenceKeys.members(workspaceId),
    queryFn: async () => [] as PresenceMember[],
    initialData: [] as PresenceMember[],
    staleTime: Infinity,
    enabled: false,
  })
  const self = useQuery({
    queryKey: presenceKeys.self(workspaceId),
    queryFn: async () => null as string | null,
    initialData: null as string | null,
    staleTime: Infinity,
    enabled: false,
  })
  return (presence.data ?? []).filter(
    (member) => member.taskId === taskId && member.userId !== self.data
  )
}

export function useBoardCursors(workspaceId: string, projectId: string) {
  const cursors = useQuery({
    queryKey: presenceKeys.cursors(workspaceId),
    queryFn: async () => [] as PresenceCursor[],
    initialData: [] as PresenceCursor[],
    staleTime: Infinity,
    enabled: false,
  })
  const self = useQuery({
    queryKey: presenceKeys.self(workspaceId),
    queryFn: async () => null as string | null,
    initialData: null as string | null,
    staleTime: Infinity,
    enabled: false,
  })
  return (cursors.data ?? []).filter(
    (cursor) => cursor.userId !== self.data && cursor.projectId === projectId
  )
}
