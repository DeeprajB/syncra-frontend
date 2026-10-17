"use client"

import { useEffect, useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { UserRound, X } from "lucide-react"
import { toast } from "sonner"

import { deleteTask, loadTaskActivity } from "@/app/dashboard/task-actions"
import { TaskComments } from "@/components/dashboard/task-comments"
import { useTaskViewers } from "@/components/dashboard/workspace-socket"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { taskKeys } from "@/lib/query"
import {
  formatTaskDue,
  TASK_COLUMNS,
  taskPriorityLabel,
  taskStatusLabel,
  type Task,
  type TaskActivity,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks"
import { setWatchedTask } from "@/lib/realtime"
import { cn } from "@/lib/utils"
import type { WorkspaceMember, WorkspaceRole } from "@/lib/workspaces"

const priorityChip: Record<TaskPriority, string> = {
  low: "bg-[#F8FAFC] text-[#64748B]",
  medium: "bg-[#F1F5F9] text-[#475569]",
  high: "bg-[#EEF2FF] text-[#4F46E5]",
  urgent: "bg-[#FFF1F2] text-[#E11D48]",
}

const avatarTones = [
  "bg-[#6366F1]",
  "bg-[#0EA5E9]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
  "bg-[#8B5CF6]",
]

const ACTIVITY_PREVIEW = 4

export function TaskDetailDialog({
  workspaceId,
  projectId,
  task,
  members,
  canEdit,
  canDelete,
  role,
  actorId,
  open,
  onOpenChange,
  onEdit,
}: {
  workspaceId: string
  projectId: string
  task: Task
  members: WorkspaceMember[]
  canEdit: boolean
  canDelete: boolean
  role?: WorkspaceRole
  actorId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, startDelete] = useTransition()
  const [seenTaskId, setSeenTaskId] = useState(task.id)
  const [showHistory, setShowHistory] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const activity = useQuery({
    queryKey: taskKeys.activity(task.id),
    queryFn: () => loadTaskActivity(task.id),
    enabled: open,
  })
  const assignee = members.find((member) => member.userId === task.assigneeId)
  const viewers = useTaskViewers(workspaceId, task.id)
  const assigneeIsViewing = viewers.some(
    (viewer) => viewer.userId === task.assigneeId
  )
  const otherViewers = viewers.filter(
    (viewer) => viewer.userId !== task.assigneeId
  )
  const description = task.description?.trim() ?? ""

  useEffect(() => {
    if (!open) {
      return
    }
    setWatchedTask(workspaceId, task.id)
    return () => setWatchedTask(workspaceId, null)
  }, [open, task.id, workspaceId])
  const descriptionIsLong = description.length > 180

  if (seenTaskId !== task.id) {
    setSeenTaskId(task.id)
    setShowHistory(false)
    setShowDescription(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="syncra-canvas flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden bg-white p-0 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.04)] ring-[#E2E8F0] sm:max-w-[36rem]"
        >
          <div className="relative shrink-0 px-5 pt-5 pr-12 pb-4">
            <DialogHeader className="gap-1.5">
              <DialogTitle className="font-heading text-lg leading-6 font-semibold tracking-[-0.02em] text-[#0F172A]">
                {task.title}
              </DialogTitle>
              <DialogDescription
                className={cn(
                  "text-sm leading-6 text-[#64748B]",
                  descriptionIsLong && !showDescription && "line-clamp-3"
                )}
              >
                {description || "No description yet."}
              </DialogDescription>
            </DialogHeader>
            {descriptionIsLong ? (
              <button
                type="button"
                className="mt-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                onClick={() => setShowDescription((current) => !current)}
              >
                {showDescription ? "Show less" : "Show more"}
              </button>
            ) : null}
            {otherViewers.length > 0 ? (
              <p className="mt-2 text-xs font-medium text-[#0891B2]">
                {otherViewers.map((member) => member.name).join(", ")}{" "}
                {otherViewers.length === 1 ? "is viewing" : "are viewing"}
              </p>
            ) : null}
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-3.5 right-3 text-[#64748B]"
                />
              }
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[#F1F5F9] py-4">
              <DetailItem label="Status">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      TASK_COLUMNS.find(
                        (column) => column.value === task.status
                      )?.dot
                    )}
                  />
                  {taskStatusLabel(task.status)}
                </span>
              </DetailItem>
              <DetailItem label="Priority">
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
                    priorityChip[task.priority]
                  )}
                >
                  {taskPriorityLabel(task.priority)}
                </span>
              </DetailItem>
              <DetailItem label="Assignee">
                <AssigneeValue member={assignee} viewing={assigneeIsViewing} />
              </DetailItem>
              <DetailItem label="Schedule">
                <ScheduleValue task={task} />
              </DetailItem>
            </dl>
            <section>
              <h3 className="text-sm font-semibold text-[#0F172A]">Activity</h3>
              <ActivityList
                loading={activity.isPending}
                failed={activity.isError}
                available={activity.data?.available ?? true}
                items={activity.data?.items ?? []}
                members={members}
                expanded={showHistory}
                onToggle={() => setShowHistory((current) => !current)}
                onRetry={() => activity.refetch()}
              />
            </section>
            <TaskComments
              workspaceId={workspaceId}
              taskId={task.id}
              canPost={canEdit}
              role={role}
              actorId={actorId}
            />
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center border-[#E2E8F0] bg-white sm:justify-end">
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                disabled={deleting}
                className="mr-auto font-semibold text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete
              </Button>
            ) : null}
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="font-semibold text-[#0F172A]"
                />
              }
            >
              Close
            </DialogClose>
            {canEdit ? (
              <Button
                type="button"
                className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
                onClick={onEdit}
              >
                Edit
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {canDelete ? (
        <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
          <AlertDialogContent className="syncra-canvas bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {task.title}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the task. It cannot be restored.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                variant="destructive"
                onClick={() => {
                  startDelete(async () => {
                    const result = await deleteTask(task.id)
                    if (!result.ok) {
                      toast.error(result.message)
                      if (result.conflict) {
                        router.refresh()
                      }
                      return
                    }
                    toast.success("Task deleted")
                    queryClient.invalidateQueries({
                      queryKey: taskKeys.list(projectId),
                    })
                    setConfirmingDelete(false)
                    onOpenChange(false)
                    router.refresh()
                  })
                }}
              >
                Delete task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  )
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 text-sm text-[#0F172A]">{children}</dd>
    </div>
  )
}

function AssigneeValue({
  member,
  viewing,
}: {
  member?: WorkspaceMember
  viewing: boolean
}) {
  if (!member) {
    return (
      <span className="inline-flex items-center gap-2 text-[#64748B]">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#F1F5F9]">
          <UserRound className="size-3" />
        </span>
        Unassigned
      </span>
    )
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="relative shrink-0">
        <MemberAvatar member={member} />
        {viewing ? (
          <span
            aria-hidden
            className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-[#06B6D4] ring-2 ring-white"
          />
        ) : null}
      </span>
      <span className="truncate">{member.name || member.email}</span>
      {viewing ? (
        <span className="shrink-0 text-xs font-medium text-[#0891B2]">
          Viewing
        </span>
      ) : null}
    </span>
  )
}

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  const [failed, setFailed] = useState(false)
  if (member.avatarUrl && !failed) {
    return (
      // Avatars come from the Syncra API.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="size-5 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white",
        avatarTone(member.userId)
      )}
    >
      {initials(member.name, member.email)}
    </span>
  )
}

function ScheduleValue({ task }: { task: Task }) {
  const start = formatTaskDue(task.startDate)
  const due = formatTaskDue(task.dueDate)
  const relation = dueRelation(task.dueDate, task.status)
  const hours =
    task.estimatedHours === null ? null : formatHours(task.estimatedHours)
  const completed =
    task.status === "done" ? formatTaskDue(task.completedAt) : null

  if (!start && !due && !hours && !completed) {
    return <span className="text-[#94A3B8]">Not scheduled</span>
  }

  const dueClass = relation === "overdue" ? "text-[#E11D48]" : undefined
  const hasDates = Boolean(start || due || completed)

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {start && due ? (
        <>
          <span>{start}</span>
          <span className="text-[#CBD5E1]" aria-hidden="true">
            –
          </span>
          <span className={dueClass}>{due}</span>
        </>
      ) : null}
      {!start && due ? <span className={dueClass}>{due}</span> : null}
      {start && !due ? <span>Starts {start}</span> : null}
      {relation === "overdue" ? (
        <span className="text-xs font-medium text-[#E11D48]">Overdue</span>
      ) : null}
      {relation === "today" ? (
        <span className="text-xs font-medium text-[#D97706]">Due today</span>
      ) : null}
      {completed ? (
        <span className="font-medium text-[#059669]">
          Completed {completed}
        </span>
      ) : null}
      {hours ? (
        <span className="text-[#64748B]">
          {hasDates ? `· ${hours}` : hours}
        </span>
      ) : null}
    </span>
  )
}

function ActivityList({
  loading,
  failed,
  available,
  items,
  members,
  expanded,
  onToggle,
  onRetry,
}: {
  loading: boolean
  failed: boolean
  available: boolean
  items: TaskActivity[]
  members: WorkspaceMember[]
  expanded: boolean
  onToggle: () => void
  onRetry: () => void
}) {
  if (loading) {
    return (
      <div className="mt-3 flex flex-col gap-3" aria-busy="true">
        <span className="sr-only">Loading activity</span>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-[#E2E8F0]" />
            <span className="h-4 flex-1 animate-pulse rounded-md bg-[#F1F5F9]" />
          </div>
        ))}
      </div>
    )
  }
  if (failed) {
    return (
      <div className="mt-2 flex items-center gap-3 text-sm text-[#64748B]">
        <p>Couldn&apos;t load activity.</p>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onRetry}
        >
          Try again
        </Button>
      </div>
    )
  }
  if (!available) {
    return (
      <p className="mt-2 text-sm text-[#94A3B8]">
        Task history isn&apos;t available yet.
      </p>
    )
  }
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-[#94A3B8]">No activity yet.</p>
  }

  const hidden = Math.max(items.length - ACTIVITY_PREVIEW, 0)
  const visible =
    expanded || hidden === 0 ? items : items.slice(0, ACTIVITY_PREVIEW)

  return (
    <ol className="mt-3">
      {visible.map((item, index) => {
        const actor = members.find((member) => member.userId === item.actorId)
        const continues = index < visible.length - 1 || hidden > 0
        return (
          <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {continues ? (
              <span
                aria-hidden
                className="absolute top-2 bottom-0 left-[4px] w-px bg-[#E2E8F0]"
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-white",
                activityDot(item.action)
              )}
            />
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <p className="text-sm leading-5 text-[#0F172A]">
                <span className="font-medium">
                  {actor?.name || actor?.email || "Someone"}
                </span>{" "}
                {item.summary}
              </p>
              <time
                dateTime={item.createdAt}
                title={fullActivityTime(item.createdAt)}
                className="shrink-0 text-xs text-[#94A3B8]"
              >
                {formatActivityTime(item.createdAt)}
              </time>
            </div>
          </li>
        )
      })}
      {hidden > 0 ? (
        <li className="relative flex gap-3">
          <span
            aria-hidden
            className={cn(
              "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full bg-[#E2E8F0] ring-2 ring-white"
            )}
          />
          <button
            type="button"
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            onClick={onToggle}
          >
            {expanded ? "Show less" : `Show ${hidden} earlier`}
          </button>
        </li>
      ) : null}
    </ol>
  )
}

function dueRelation(due: string | null, status: TaskStatus) {
  if (!due || status === "done") {
    return "none" as const
  }
  const date = new Date(due)
  if (Number.isNaN(date.getTime())) {
    return "none" as const
  }
  const dueDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
  const now = new Date()
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )
  if (dueDay < today) {
    return "overdue" as const
  }
  if (dueDay === today) {
    return "today" as const
  }
  return "none" as const
}

function formatHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours}h`
}

function activityDot(action: string) {
  if (action === "task.created") {
    return "bg-[#10B981]"
  }
  if (action === "task.moved" || action === "task.status_changed") {
    return "bg-[#3B82F6]"
  }
  if (action === "task.assigned") {
    return "bg-[#8B5CF6]"
  }
  return "bg-[#94A3B8]"
}

function formatActivityTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const now = new Date()
  if (sameDay(date, now)) {
    return time
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(date, yesterday)) {
    return `Yesterday, ${time}`
  }
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  return `${day}, ${time}`
}

function fullActivityTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function initials(name: string, email: string) {
  const source = name.trim() || email.trim()
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "S").toUpperCase()
}

function avatarTone(id: string) {
  let hash = 0
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % avatarTones.length
  }
  return avatarTones[hash]
}
