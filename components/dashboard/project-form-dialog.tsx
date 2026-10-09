"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, Plus, X } from "lucide-react"
import { toast } from "sonner"

import {
  createProject,
  updateProject,
  type ProjectFormState,
} from "@/app/dashboard/project-actions"
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
  PROJECT_DESCRIPTION_MAX,
  PROJECT_STATUSES,
  PROJECT_TITLE_MAX,
  projectStatusLabel,
  type Project,
  type ProjectStatus,
} from "@/lib/projects"

const initialState: ProjectFormState = { status: "idle" }

const dialogClassName =
  "syncra-canvas gap-0 bg-white p-0 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.04)] ring-[#E2E8F0] sm:max-w-[28rem]"

const statusTone: Record<ProjectStatus, string> = {
  planning: "bg-[#6366F1]",
  active: "bg-[#10B981]",
  completed: "bg-[#64748B]",
  archived: "bg-[#94A3B8]",
}

export function ProjectFormDialog({
  mode,
  workspaceId,
  workspaceTitle,
  project,
  hideTrigger = false,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit"
  workspaceId: string
  workspaceTitle: string
  project?: Project
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const dialogOpen = open ?? uncontrolledOpen

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
      {hideTrigger ? null : (
        <DialogTrigger
          render={
            <Button className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]" />
          }
        >
          <Plus className="size-4" />
          Create project
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false} className={dialogClassName}>
        <ProjectForm
          key={formKey}
          mode={mode}
          workspaceId={workspaceId}
          workspaceTitle={workspaceTitle}
          project={project}
          onSuccess={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ProjectForm({
  mode,
  workspaceId,
  workspaceTitle,
  project,
  onSuccess,
}: {
  mode: "create" | "edit"
  workspaceId: string
  workspaceTitle: string
  project?: Project
  onSuccess: () => void
}) {
  const router = useRouter()
  const action =
    mode === "create"
      ? createProject.bind(null, workspaceId)
      : updateProject.bind(null, project as Project)
  const [title, setTitle] = useState(project?.title ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "planning"
  )
  const [state, formAction, pending] = useActionState(action, initialState)
  const [trackedState, setTrackedState] = useState(state)
  const [cleared, setCleared] = useState({
    title: false,
    description: false,
    status: false,
    form: false,
  })

  if (trackedState !== state) {
    setTrackedState(state)
    setCleared({ title: false, description: false, status: false, form: false })
  }

  const titleError =
    state.field === "title" && !cleared.title ? state.message : null
  const descriptionError =
    state.field === "description" && !cleared.description ? state.message : null
  const statusError =
    state.field === "status" && !cleared.status ? state.message : null
  const formError =
    state.status === "error" && !state.field && !cleared.form
      ? state.message
      : null

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    toast.success(mode === "create" ? "Project created" : "Project updated", {
      id: mode === "create" ? "create-project" : `update-${project?.id}`,
      description: state.title,
    })
    onSuccess()
    router.refresh()
  }, [mode, onSuccess, project?.id, router, state.status, state.title])

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <div className="relative flex flex-col gap-4 px-5 pt-5 pb-4">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle className="font-semibold tracking-[-0.01em] text-[#0F172A]">
            {mode === "create" ? "Create project" : "Edit project"}
          </DialogTitle>
          <DialogDescription className="text-[#64748B]">
            {mode === "create"
              ? `Create a project inside ${workspaceTitle}.`
              : "Update the name, description, or status."}
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
            <FieldLabel htmlFor="project-name" className="gap-1">
              Project name
              <span className="text-[#EF4444]" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Input
              id="project-name"
              name="title"
              value={title}
              placeholder="e.g. Machine Learning Assignment"
              autoComplete="off"
              autoFocus
              maxLength={PROJECT_TITLE_MAX}
              disabled={pending}
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
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="project-description" className="w-auto">
                Description
              </FieldLabel>
              <span className="text-xs font-medium text-[#94A3B8]">
                Optional
              </span>
            </div>
            <Textarea
              id="project-description"
              name="description"
              value={description}
              placeholder="What is this project about?"
              rows={3}
              maxLength={PROJECT_DESCRIPTION_MAX}
              disabled={pending}
              aria-invalid={descriptionError ? true : undefined}
              onChange={(event) => {
                setDescription(event.target.value)
                setCleared((current) => ({ ...current, description: true }))
              }}
              className="min-h-20 placeholder:text-[#94A3B8]"
            />
            <FieldError>{descriptionError}</FieldError>
          </Field>
          <Field data-invalid={statusError ? true : undefined}>
            <FieldLabel htmlFor="project-status">Status</FieldLabel>
            <input type="hidden" name="status" value={status} />
            <Select
              value={status}
              items={PROJECT_STATUSES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              disabled={pending}
              onValueChange={(value) => {
                if (!value || !isListedStatus(value)) {
                  return
                }
                setStatus(value)
                setCleared((current) => ({ ...current, status: true }))
              }}
            >
              <SelectTrigger
                id="project-status"
                className="h-9 w-full bg-white"
              >
                <SelectValue>
                  {(value) => <StatusOption value={String(value ?? status)} />}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="syncra-canvas bg-white">
                <SelectGroup>
                  {PROJECT_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <StatusOption value={item.value} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError>{statusError}</FieldError>
          </Field>
        </FieldGroup>
        {formError ? (
          <Alert
            variant="destructive"
            className="border-[#FECACA] bg-[#FEF2F2]"
          >
            <CircleAlert />
            <AlertTitle>
              {mode === "create"
                ? "Couldn't create the project"
                : "Couldn't update the project"}
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
      <DialogFooter className="mx-0 mb-0 bg-white">
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className="font-semibold text-[#0F172A]"
            />
          }
        >
          Cancel
        </DialogClose>
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
        >
          {pending ? <Spinner /> : null}
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}

function StatusOption({ value }: { value: string }) {
  const status = isListedStatus(value) ? value : "planning"
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${statusTone[status]}`} />
      {projectStatusLabel(status)}
    </span>
  )
}

function isListedStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((item) => item.value === value)
}
