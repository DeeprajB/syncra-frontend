"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { CircleAlert, Plus, X } from "lucide-react"
import { toast } from "sonner"

import {
  createTask,
  deleteTask,
  updateTask,
  type TaskField,
  type TaskFormState,
} from "@/app/dashboard/task-actions"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  isoToDateInput,
  isTaskPriority,
  isTaskStatus,
  TASK_COLUMNS,
  TASK_DESCRIPTION_MAX,
  TASK_PRIORITIES,
  TASK_TITLE_MAX,
  taskPriorityLabel,
  taskStatusLabel,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks"
import { taskKeys } from "@/lib/query"
import type { WorkspaceMember } from "@/lib/workspaces"

const initialState: TaskFormState = { status: "idle" }

const dialogClassName =
  "syncra-canvas max-h-[calc(100svh-2rem)] gap-0 overflow-y-auto bg-white p-0 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.04)] ring-[#E2E8F0] sm:max-w-[32rem]"

const priorityTone: Record<TaskPriority, string> = {
  low: "bg-[#CBD5E1]",
  medium: "bg-[#94A3B8]",
  high: "bg-[#6366F1]",
  urgent: "bg-[#F43F5E]",
}

const statusTone: Record<TaskStatus, string> = {
  todo: "bg-[#94A3B8]",
  in_progress: "bg-[#3B82F6]",
  review: "bg-[#8B5CF6]",
  done: "bg-[#10B981]",
}

export function TaskFormDialog({
  projectId,
  projectTitle,
  members,
  task,
  defaultStatus = "todo",
  canEdit,
  canDelete = false,
  hideTrigger = false,
  open,
  onOpenChange,
}: {
  projectId: string
  projectTitle: string
  members: WorkspaceMember[]
  task?: Task
  defaultStatus?: TaskStatus
  canEdit: boolean
  canDelete?: boolean
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const dialogOpen = open ?? uncontrolledOpen
  const mode = task ? "edit" : "create"

  function setDialogOpen(next: boolean) {
    if (open === undefined) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
    if (next) {
      setFormKey((key) => key + 1)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {hideTrigger || !canEdit ? null : (
        <DialogTrigger
          render={
            <Button className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]" />
          }
        >
          <Plus className="size-4" />
          Create task
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false} className={dialogClassName}>
        <TaskForm
          key={formKey}
          mode={mode}
          projectId={projectId}
          projectTitle={projectTitle}
          members={members}
          task={task}
          defaultStatus={defaultStatus}
          canEdit={canEdit}
          canDelete={canDelete}
          onSuccess={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function TaskForm({
  mode,
  projectId,
  projectTitle,
  members,
  task,
  defaultStatus,
  canEdit,
  canDelete,
  onSuccess,
}: {
  mode: "create" | "edit"
  projectId: string
  projectTitle: string
  members: WorkspaceMember[]
  task?: Task
  defaultStatus: TaskStatus
  canEdit: boolean
  canDelete: boolean
  onSuccess: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const action =
    mode === "create"
      ? createTask.bind(null, projectId)
      : updateTask.bind(null, task as Task)
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "unassigned")
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium"
  )
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? defaultStatus
  )
  const [startDate, setStartDate] = useState(
    isoToDateInput(task?.startDate ?? null)
  )
  const [dueDate, setDueDate] = useState(isoToDateInput(task?.dueDate ?? null))
  const [state, formAction, pending] = useActionState(action, initialState)
  const [trackedState, setTrackedState] = useState(state)
  const [cleared, setCleared] = useState({
    title: false,
    description: false,
    assignee_id: false,
    priority: false,
    status: false,
    start_date: false,
    due_date: false,
    form: false,
  })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, startDelete] = useTransition()

  if (trackedState !== state) {
    setTrackedState(state)
    setCleared({
      title: false,
      description: false,
      assignee_id: false,
      priority: false,
      status: false,
      start_date: false,
      due_date: false,
      form: false,
    })
  }

  const titleError = fieldError(state, cleared, "title")
  const descriptionError = fieldError(state, cleared, "description")
  const assigneeError = fieldError(state, cleared, "assignee_id")
  const priorityError = fieldError(state, cleared, "priority")
  const statusError = fieldError(state, cleared, "status")
  const startError = fieldError(state, cleared, "start_date")
  const dueError = fieldError(state, cleared, "due_date")
  const formError =
    state.status === "error" && !state.field && !cleared.form
      ? state.message
      : null
  const readOnly = !canEdit
  const busy = pending || deleting

  useEffect(() => {
    if (state.conflict) {
      router.refresh()
    }
    if (state.status !== "success") {
      return
    }

    toast.success(mode === "create" ? "Task created" : "Task updated", {
      id: mode === "create" ? "create-task" : `update-${task?.id}`,
      description: state.title,
    })
    queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
    if (task) {
      queryClient.invalidateQueries({ queryKey: taskKeys.activity(task.id) })
    }
    onSuccess()
    router.refresh()
  }, [
    mode,
    onSuccess,
    projectId,
    queryClient,
    router,
    state.conflict,
    state.status,
    state.title,
    task,
  ])

  const assigneeItems = [
    { value: "unassigned", label: "Unassigned" },
    ...members.map((member) => ({
      value: member.userId,
      label: member.name || member.email,
    })),
  ]

  return (
    <>
      <form action={formAction} noValidate className="flex flex-col">
        <div className="relative flex flex-col gap-4 px-5 pt-5 pb-4">
          <DialogHeader className="gap-1 pr-8">
            <DialogTitle className="font-semibold tracking-[-0.01em] text-[#0F172A]">
              {mode === "create" ? "Create task" : "Edit task"}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {mode === "create"
                ? `Create a new task inside ${projectTitle}.`
                : readOnly
                  ? "You can view this task. Viewers cannot edit it."
                  : "Update the title, assignee, or schedule."}
            </DialogDescription>
          </DialogHeader>
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
          <FieldGroup className="gap-4">
            <Field data-invalid={titleError ? true : undefined}>
              <FieldLabel htmlFor="task-title" className="gap-1">
                Task title
                <span className="text-[#EF4444]" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="task-title"
                name="title"
                value={title}
                placeholder="e.g. Implement preprocessing pipeline"
                autoComplete="off"
                autoFocus
                maxLength={TASK_TITLE_MAX}
                disabled={busy || readOnly}
                aria-invalid={titleError ? true : undefined}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setCleared((current) => ({ ...current, title: true }))
                }}
                className="h-9 placeholder:text-[#94A3B8]"
              />
              <FieldError>{titleError}</FieldError>
            </Field>
            <Field data-invalid={descriptionError ? true : undefined}>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                name="description"
                value={description}
                placeholder="Add details, acceptance criteria, or notes..."
                rows={3}
                maxLength={TASK_DESCRIPTION_MAX}
                disabled={busy || readOnly}
                aria-invalid={descriptionError ? true : undefined}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setCleared((current) => ({ ...current, description: true }))
                }}
                className="min-h-20 placeholder:text-[#94A3B8]"
              />
              <FieldError>{descriptionError}</FieldError>
            </Field>
            <Field data-invalid={assigneeError ? true : undefined}>
              <FieldLabel htmlFor="task-assignee">Assignee</FieldLabel>
              <input type="hidden" name="assignee_id" value={assigneeId} />
              <Select
                value={assigneeId}
                items={assigneeItems}
                disabled={busy || readOnly}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }
                  setAssigneeId(String(value))
                  setCleared((current) => ({ ...current, assignee_id: true }))
                }}
              >
                <SelectTrigger
                  id="task-assignee"
                  className="h-9 w-full bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="syncra-canvas bg-white">
                  <SelectGroup>
                    {assigneeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{assigneeError}</FieldError>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={priorityError ? true : undefined}>
                <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                <input type="hidden" name="priority" value={priority} />
                <Select
                  value={priority}
                  items={TASK_PRIORITIES.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  disabled={busy || readOnly}
                  onValueChange={(value) => {
                    if (!value || !isTaskPriority(String(value))) {
                      return
                    }
                    setPriority(String(value) as TaskPriority)
                    setCleared((current) => ({ ...current, priority: true }))
                  }}
                >
                  <SelectTrigger
                    id="task-priority"
                    className="h-9 w-full bg-white"
                  >
                    <SelectValue>
                      {(value) => (
                        <PriorityOption
                          value={String(value ?? priority) as TaskPriority}
                        />
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="syncra-canvas bg-white">
                    <SelectGroup>
                      {TASK_PRIORITIES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <PriorityOption value={item.value} />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{priorityError}</FieldError>
              </Field>
              <Field data-invalid={statusError ? true : undefined}>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <input type="hidden" name="status" value={status} />
                <Select
                  value={status}
                  items={TASK_COLUMNS.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  disabled={busy || readOnly}
                  onValueChange={(value) => {
                    if (!value || !isTaskStatus(String(value))) {
                      return
                    }
                    setStatus(String(value) as TaskStatus)
                    setCleared((current) => ({ ...current, status: true }))
                  }}
                >
                  <SelectTrigger
                    id="task-status"
                    className="h-9 w-full bg-white"
                  >
                    <SelectValue>
                      {(value) => (
                        <StatusOption
                          value={String(value ?? status) as TaskStatus}
                        />
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="syncra-canvas bg-white">
                    <SelectGroup>
                      {TASK_COLUMNS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <StatusOption value={item.value} />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{statusError}</FieldError>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={startError ? true : undefined}>
                <FieldLabel htmlFor="task-start">Start date</FieldLabel>
                <Input
                  id="task-start"
                  name="start_date"
                  type="date"
                  value={startDate}
                  disabled={busy || readOnly}
                  aria-invalid={startError ? true : undefined}
                  onChange={(event) => {
                    setStartDate(event.target.value)
                    setCleared((current) => ({ ...current, start_date: true }))
                  }}
                  className="h-9 bg-white"
                />
                <FieldError>{startError}</FieldError>
              </Field>
              <Field data-invalid={dueError ? true : undefined}>
                <FieldLabel htmlFor="task-due">Due date</FieldLabel>
                <Input
                  id="task-due"
                  name="due_date"
                  type="date"
                  value={dueDate}
                  disabled={busy || readOnly}
                  aria-invalid={dueError ? true : undefined}
                  onChange={(event) => {
                    setDueDate(event.target.value)
                    setCleared((current) => ({ ...current, due_date: true }))
                  }}
                  className="h-9 bg-white"
                />
                <FieldError>{dueError}</FieldError>
              </Field>
            </div>
          </FieldGroup>
          {formError ? (
            <Alert
              variant="destructive"
              className="border-[#FECACA] bg-[#FEF2F2]"
            >
              <CircleAlert />
              <AlertTitle>
                {mode === "create"
                  ? "Couldn't create the task"
                  : "Couldn't update the task"}
              </AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter className="mx-0 mb-0 bg-white">
          {mode === "edit" && canDelete ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
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
                disabled={busy}
                className="font-semibold text-[#0F172A]"
              />
            }
          >
            {readOnly ? "Close" : "Cancel"}
          </DialogClose>
          {readOnly ? null : (
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
            >
              {pending ? <Spinner /> : null}
              {mode === "create" ? "Create task" : "Save changes"}
            </Button>
          )}
        </DialogFooter>
      </form>
      {task && canDelete ? (
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
                    onSuccess()
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

function fieldError(
  state: TaskFormState,
  cleared: Record<string, boolean>,
  field: TaskField
) {
  if (state.field !== field || cleared[field]) {
    return null
  }
  return state.message ?? null
}

function PriorityOption({ value }: { value: TaskPriority }) {
  const priority = isTaskPriority(value) ? value : "medium"
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${priorityTone[priority]}`} />
      {taskPriorityLabel(priority)}
    </span>
  )
}

function StatusOption({ value }: { value: TaskStatus }) {
  const status = isTaskStatus(value) ? value : "todo"
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${statusTone[status]}`} />
      {taskStatusLabel(status)}
    </span>
  )
}
