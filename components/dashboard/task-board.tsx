"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Columns3,
  Ellipsis,
  Plus,
  Search,
  SignalHigh,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { loadProject } from "@/app/dashboard/project-actions"
import { loadProjectTasks, moveTask } from "@/app/dashboard/task-actions"
import { ProjectStatusBadge } from "@/components/dashboard/project-board"
import { ArchiveProjectDialog } from "@/components/dashboard/project-board"
import { ProjectFormDialog } from "@/components/dashboard/project-form-dialog"
import { TaskDetailDialog } from "@/components/dashboard/task-detail-dialog"
import { TaskFormDialog } from "@/components/dashboard/task-form-dialog"
import { PersonAvatar } from "@/components/dashboard/person-avatar"
import { useTaskViewers } from "@/components/dashboard/workspace-socket"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Project } from "@/lib/projects"
import { projectKeys, taskKeys } from "@/lib/query"
import {
  canDeleteTask,
  canEditTasks,
  formatTaskDue,
  isTaskPriority,
  isTaskStatus,
  TASK_COLUMNS,
  TASK_PRIORITIES,
  taskPriorityLabel,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks"
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

export function TaskBoard({
  workspaceId,
  workspaceTitle,
  project,
  tasks: initialTasks,
  tasksError,
  members,
  actorId,
  role,
}: {
  workspaceId: string
  workspaceTitle: string
  project: Project
  tasks: Task[]
  tasksError?: string
  members: WorkspaceMember[]
  actorId?: string
  role?: WorkspaceRole
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const canEdit = canEditTasks(role)
  const canManage = role === "owner" || role === "admin"
  const projectQuery = useQuery({
    queryKey: projectKeys.detail(project.id),
    queryFn: () => loadProject(project.id),
    initialData: project,
  })
  const tasksQuery = useQuery({
    queryKey: taskKeys.list(project.id),
    queryFn: () => loadProjectTasks(project.id),
    initialData: tasksError ? undefined : initialTasks,
  })
  const tasks = tasksQuery.data ?? []
  const shownProject = projectQuery.data ?? project
  const [query, setQuery] = useState("")
  const [assignee, setAssignee] = useState("all")
  const [priority, setPriority] = useState("all")
  const [editing, setEditing] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<{
    task?: Task
    status: TaskStatus
  } | null>(null)
  const [detail, setDetail] = useState<Task | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<{
    status: TaskStatus
    index: number
  } | null>(null)
  const move = useMutation({
    mutationFn: async (input: {
      task: Task
      status: TaskStatus
      position: number
    }) => {
      const result = await moveTask(
        input.task.id,
        input.status,
        input.position,
        input.task.version
      )
      if (!result.ok) {
        throw new Error(result.message ?? "Couldn't move the task.")
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list(project.id) })
      const previous = queryClient.getQueryData<Task[]>(
        taskKeys.list(project.id)
      )
      queryClient.setQueryData<Task[]>(taskKeys.list(project.id), (current) =>
        applyMove(current ?? [], input.task.id, input.status, input.position)
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.list(project.id), context.previous)
      }
      toast.error(
        error instanceof Error ? error.message : "Couldn't move the task."
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(project.id) })
    },
  })

  useEffect(() => {
    queryClient.setQueryData(projectKeys.detail(project.id), project)
  }, [project, queryClient])

  const filtering =
    query.trim().length > 0 || assignee !== "all" || priority !== "all"
  const visible = tasks.filter((task) =>
    matches(task, query, assignee, priority)
  )
  const membersById = new Map(members.map((member) => [member.userId, member]))

  function openCreate(status: TaskStatus) {
    setDraft({ status })
    setDialogOpen(true)
  }

  function openTask(task: Task) {
    setDetail(task)
  }

  function dropTask(status: TaskStatus, overIndex: number | null) {
    if (!canEdit || !draggingId || filtering || move.isPending) {
      return
    }

    const moving = tasks.find((task) => task.id === draggingId)
    if (!moving) {
      return
    }

    const column = tasks
      .filter((task) => task.status === status)
      .sort((left, right) => left.position - right.position)
    const position = destinationPosition(column, moving.id, overIndex)
    if (moving.status === status && moving.position === position) {
      return
    }

    setDraggingId(null)
    setDropIndex(null)
    move.mutate({ task: moving, status, position })
  }

  function hoverColumn(status: TaskStatus, index: number) {
    setDropIndex((current) =>
      current?.status === status && current.index === index
        ? current
        : { status, index }
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col px-6 py-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">
            <Link
              href={`/dashboard/workspaces/${workspaceId}/projects`}
              className="hover:text-[#0F172A]"
            >
              Projects
            </Link>
            <span className="px-1.5 text-[#CBD5E1]">/</span>
            <span className="text-[#475569]">{shownProject.title}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="shrink-0 font-heading text-[1.75rem] leading-9 font-bold tracking-[-0.025em] text-[#0F172A]">
              {shownProject.title}
            </h1>
            <ProjectStatusBadge project={shownProject} />
          </div>
          {shownProject.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
              {shownProject.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canEdit ? (
            <Button
              type="button"
              className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
              onClick={() => openCreate("todo")}
            >
              <Plus className="size-4" />
              Create task
            </Button>
          ) : null}
          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] outline-none hover:bg-[#F8FAFC]"
                aria-label="Project actions"
              >
                <Ellipsis className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="syncra-canvas w-40 bg-white"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setArchiveOpen(true)}
                  >
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterMenu
          label="Assignee"
          icon={<UserRound className="size-4" />}
          value={assignee}
          onChange={setAssignee}
          options={[
            { value: "all", label: "All assignees" },
            { value: "unassigned", label: "Unassigned" },
            ...members.map((member) => ({
              value: member.userId,
              label: member.name || member.email,
            })),
          ]}
        />
        <FilterMenu
          label="Priority"
          icon={<SignalHigh className="size-4" />}
          value={priority}
          onChange={setPriority}
          options={[
            { value: "all", label: "All priorities" },
            ...TASK_PRIORITIES.map((item) => ({
              value: item.value,
              label: item.label,
            })),
          ]}
        />
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            value={query}
            placeholder="Search tasks..."
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 bg-white pl-8"
          />
        </div>
      </div>

      {tasksQuery.isPending ? (
        <p className="mt-8 text-sm text-[#64748B]">Loading tasks…</p>
      ) : tasksQuery.isError && tasks.length === 0 ? (
        <div className="mt-8 flex items-center gap-3 text-sm text-[#64748B]">
          <p>
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : "Couldn't load tasks."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-8 bg-white"
            onClick={() => tasksQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="relative mt-4 flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {TASK_COLUMNS.map((column) => {
              const cards = visible
                .filter((task) => task.status === column.value)
                .sort((left, right) => left.position - right.position)
              const draggedHere = cards.findIndex(
                (card) => card.id === draggingId
              )
              const showEndSlot =
                dropIndex?.status === column.value &&
                dropIndex.index >= cards.length &&
                (cards.length === 0 || draggedHere !== cards.length - 1)
              return (
                <section
                  key={column.value}
                  className={cn(
                    "flex min-h-64 flex-col rounded-2xl p-2.5 transition-colors",
                    dropIndex?.status === column.value
                      ? "bg-[#E8EDF3]"
                      : "bg-[#F1F5F9]"
                  )}
                  onDragOver={(event) => {
                    if (!canEdit || filtering || !draggingId) {
                      return
                    }
                    event.preventDefault()
                    event.dataTransfer.dropEffect = "move"
                    hoverColumn(
                      column.value,
                      cards.length === 0 ? 0 : cards.length
                    )
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    const index =
                      dropIndex?.status === column.value
                        ? dropIndex.index
                        : cards.length
                    dropTask(column.value, index >= cards.length ? null : index)
                  }}
                >
                  <div className="flex items-center justify-between px-1.5 py-1">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <span className={`size-2 rounded-full ${column.dot}`} />
                      {column.label}
                      <span className="font-medium text-[#94A3B8]">
                        {cards.length}
                      </span>
                    </h2>
                    {canEdit ? (
                      <button
                        type="button"
                        className="flex size-6 items-center justify-center rounded-md text-[#64748B] hover:bg-white"
                        aria-label={`Add a task to ${column.label}`}
                        onClick={() => openCreate(column.value)}
                      >
                        <Plus className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
                    {cards.map((task, index) => {
                      const fromHere = cards.some(
                        (card) => card.id === draggingId
                      )
                      const fromIndex = cards.findIndex(
                        (card) => card.id === draggingId
                      )
                      const slotHere =
                        dropIndex?.status === column.value &&
                        dropIndex.index === index &&
                        (!fromHere ||
                          (index !== fromIndex && index !== fromIndex + 1))
                      return (
                        <div
                          key={task.id}
                          className="pb-2"
                          onDragOver={(event) => {
                            if (!canEdit || filtering || !draggingId) {
                              return
                            }
                            event.preventDefault()
                            event.stopPropagation()
                            event.dataTransfer.dropEffect = "move"
                            const card =
                              event.currentTarget.querySelector("article")
                            const bounds = card?.getBoundingClientRect()
                            const after = bounds
                              ? event.clientY > bounds.top + bounds.height / 2
                              : false
                            hoverColumn(column.value, after ? index + 1 : index)
                          }}
                          onDrop={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            const next =
                              dropIndex?.status === column.value
                                ? dropIndex.index
                                : index
                            dropTask(column.value, next)
                          }}
                        >
                          {slotHere ? <DropSlot /> : null}
                          <TaskCard
                            workspaceId={workspaceId}
                            task={task}
                            member={
                              task.assigneeId
                                ? membersById.get(task.assigneeId)
                                : undefined
                            }
                            draggable={canEdit && !filtering}
                            dragging={draggingId === task.id}
                            onOpen={() => openTask(task)}
                            onDragStart={() => setDraggingId(task.id)}
                            onDragEnd={() => {
                              setDraggingId(null)
                              setDropIndex(null)
                            }}
                          />
                        </div>
                      )
                    })}
                    {showEndSlot ? <DropSlot /> : null}
                  </div>
                </section>
              )
            })}
          </div>
          {tasks.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24">
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white px-6 py-8 text-center shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)]">
                <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#64748B]">
                  <ClipboardList className="size-5" />
                </span>
                <h2 className="mt-4 font-heading text-base font-semibold text-[#0F172A]">
                  No tasks yet
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  Create your first task to start organizing this project.
                </p>
                {canEdit ? (
                  <Button
                    type="button"
                    className="mt-4 h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
                    onClick={() => openCreate("todo")}
                  >
                    <Plus className="size-4" />
                    Create task
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          {tasks.length > 0 && visible.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-[#64748B]">
              No tasks match these filters.
            </p>
          ) : null}
        </div>
      )}

      {detail ? (
        <TaskDetailDialog
          workspaceId={workspaceId}
          projectId={project.id}
          task={tasks.find((task) => task.id === detail.id) ?? detail}
          members={members}
          canEdit={canEdit}
          canDelete={canDeleteTask(role, detail.createdBy, actorId)}
          role={role}
          actorId={actorId}
          open
          onOpenChange={(next) => {
            if (!next) {
              setDetail(null)
            }
          }}
          onEdit={() => {
            const current =
              tasks.find((task) => task.id === detail.id) ?? detail
            setDetail(null)
            setDraft({ task: current, status: current.status })
            setDialogOpen(true)
          }}
        />
      ) : null}
      {draft ? (
        <TaskFormDialog
          projectId={project.id}
          projectTitle={shownProject.title}
          members={members}
          task={draft.task}
          defaultStatus={draft.status}
          canEdit={canEdit}
          canDelete={
            draft.task
              ? canDeleteTask(role, draft.task.createdBy, actorId)
              : false
          }
          hideTrigger
          open={dialogOpen}
          onOpenChange={(next) => {
            setDialogOpen(next)
            if (!next) {
              setDraft(null)
            }
          }}
        />
      ) : null}
      {canManage ? (
        <>
          <ProjectFormDialog
            mode="edit"
            workspaceId={workspaceId}
            workspaceTitle={workspaceTitle}
            project={shownProject}
            hideTrigger
            open={editing}
            onOpenChange={setEditing}
          />
          <ArchiveProjectDialog
            project={project}
            open={archiveOpen}
            onOpenChange={setArchiveOpen}
            onArchived={() =>
              router.push(`/dashboard/workspaces/${workspaceId}/projects`)
            }
          />
        </>
      ) : null}
    </main>
  )
}

function DropSlot() {
  return (
    <div
      aria-hidden
      className="h-12 rounded-xl border border-dashed border-[#93C5FD] bg-[#EFF6FF]"
    />
  )
}

function TaskCard({
  workspaceId,
  task,
  member,
  draggable,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  workspaceId: string
  task: Task
  member?: WorkspaceMember
  draggable: boolean
  dragging: boolean
  onOpen: () => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const due = formatTaskDue(task.dueDate)
  const viewers = useTaskViewers(workspaceId, task.id)
  const dragged = useRef(false)

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => {
        dragged.current = true
        event.dataTransfer.setData("text/plain", task.id)
        event.dataTransfer.effectAllowed = "move"
        const preview = event.currentTarget
        const bounds = preview.getBoundingClientRect()
        const clone = preview.cloneNode(true) as HTMLElement
        clone.style.width = `${bounds.width}px`
        clone.style.position = "fixed"
        clone.style.top = "-1000px"
        clone.style.left = "0"
        clone.style.opacity = "1"
        clone.style.transform = "rotate(1deg)"
        clone.style.boxShadow = "0 16px 32px -12px rgba(15, 23, 42, 0.28)"
        document.body.appendChild(clone)
        event.dataTransfer.setDragImage(
          clone,
          Math.max(event.clientX - bounds.left, 0),
          Math.max(event.clientY - bounds.top, 0)
        )
        window.setTimeout(() => clone.remove(), 0)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-white p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40"
      )}
    >
      <button
        type="button"
        className={cn(
          "w-full text-left",
          draggable && "cursor-grab active:cursor-grabbing"
        )}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false
            return
          }
          onOpen()
        }}
      >
        <p className="text-sm leading-5 font-semibold text-[#0F172A]">
          {task.title}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium ${priorityChip[task.priority]}`}
          >
            {taskPriorityLabel(task.priority)}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {due ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                <Calendar className="size-3.5" />
                {due}
              </span>
            ) : null}
            {viewers.length > 0 ? (
              <span className="flex -space-x-1" aria-hidden>
                {viewers.slice(0, 3).map((viewer) => (
                  <PersonAvatar
                    key={viewer.userId}
                    name={viewer.name}
                    avatarUrl={viewer.avatarUrl}
                    className="size-6 ring-2 ring-[#06B6D4]"
                  />
                ))}
              </span>
            ) : null}
            {member ? <AssigneeAvatar member={member} /> : null}
          </span>
        </div>
      </button>
    </article>
  )
}

function AssigneeAvatar({ member }: { member: WorkspaceMember }) {
  const [failed, setFailed] = useState(false)
  const showPicture = Boolean(member.avatarUrl) && !failed
  if (showPicture) {
    return (
      // Avatars come from the Syncra API.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatarUrl}
        alt=""
        className="size-6 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={`flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarTone(member.userId)}`}
      title={member.name || member.email}
    >
      {initials(member.name, member.email)}
    </span>
  )
}

function FilterMenu({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string
  icon: ReactNode
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  const selected = options.find((option) => option.value === value)
  const active = value !== "all"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-sm font-medium text-[#0F172A] outline-none hover:bg-[#F8FAFC]",
          active ? "border-[#BFDBFE]" : "border-[#E2E8F0]"
        )}
      >
        <span className="text-[#64748B]">{icon}</span>
        {active && selected ? selected.label : label}
        <ChevronDown className="size-3.5 text-[#94A3B8]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="syncra-canvas max-h-72 w-56 overflow-y-auto bg-white"
      >
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function matches(
  task: Task,
  query: string,
  assignee: string,
  priority: string
) {
  const needle = query.trim().toLowerCase()
  if (needle) {
    const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase()
    if (!haystack.includes(needle)) {
      return false
    }
  }
  if (assignee === "unassigned" && task.assigneeId) {
    return false
  }
  if (
    assignee !== "all" &&
    assignee !== "unassigned" &&
    task.assigneeId !== assignee
  ) {
    return false
  }
  if (
    priority !== "all" &&
    isTaskPriority(priority) &&
    task.priority !== priority
  ) {
    return false
  }
  return true
}

function destinationPosition(
  column: Task[],
  draggedId: string,
  overIndex: number | null
) {
  const draggedIndex = column.findIndex((task) => task.id === draggedId)
  const lengthWithout = column.length - (draggedIndex === -1 ? 0 : 1)
  if (overIndex === null) {
    return lengthWithout
  }

  let index = overIndex
  if (draggedIndex !== -1 && draggedIndex < overIndex) {
    index -= 1
  }
  return Math.max(0, Math.min(index, lengthWithout))
}

function applyMove(
  tasks: Task[],
  taskId: string,
  status: TaskStatus,
  position: number
) {
  const moving = tasks.find((task) => task.id === taskId)
  if (!moving || !isTaskStatus(status)) {
    return tasks
  }

  const grouped = new Map<TaskStatus, Task[]>(
    TASK_COLUMNS.map((column) => [column.value, []])
  )
  for (const task of tasks) {
    if (task.id !== taskId) {
      grouped.get(task.status)?.push(task)
    }
  }
  for (const list of grouped.values()) {
    list.sort((left, right) => left.position - right.position)
  }
  grouped.get(status)?.splice(position, 0, { ...moving, status })

  const next: Task[] = []
  for (const column of TASK_COLUMNS) {
    const list = grouped.get(column.value) ?? []
    list.forEach((task, index) => {
      next.push({ ...task, status: column.value, position: index })
    })
  }
  return next
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
