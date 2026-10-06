"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, Plus, X } from "lucide-react"
import { toast } from "sonner"

import {
  createWorkspace,
  type CreateWorkspaceState,
} from "@/app/dashboard/workspace-actions"
import {
  WORKSPACE_DESCRIPTION_MAX,
  WORKSPACE_TITLE_MAX,
} from "@/lib/workspaces"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const initialState: CreateWorkspaceState = { status: "idle" }

const dialogClassName =
  "syncra-canvas gap-0 bg-white p-0 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.04)] ring-[#E2E8F0] sm:max-w-[28rem]"

export function CreateWorkspaceDialog({
  hideTrigger = false,
  open,
  onOpenChange,
}: {
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
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
          Create workspace
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false} className={dialogClassName}>
        <CreateWorkspaceForm
          key={formKey}
          onSuccess={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [state, formAction, pending] = useActionState(
    createWorkspace,
    initialState
  )
  const [trackedState, setTrackedState] = useState(state)
  const [cleared, setCleared] = useState({
    title: false,
    description: false,
    api: false,
  })

  if (trackedState !== state) {
    setTrackedState(state)
    setCleared({ title: false, description: false, api: false })
  }
  const titleError =
    state.error?.field === "title" && !cleared.title
      ? state.error.message
      : null
  const descriptionError =
    state.error?.field === "description" && !cleared.description
      ? state.error.message
      : null
  const apiError =
    state.error?.code === "api" && !cleared.api ? state.error.message : null

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    toast.success("Workspace created", {
      id: "create-workspace",
      description: state.title,
    })
    onSuccess()
    if (state.id) {
      router.push(`/dashboard/workspaces/${state.id}`)
    } else {
      router.refresh()
    }
  }, [onSuccess, router, state.id, state.status, state.title])

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <div className="relative flex flex-col gap-4 px-5 pt-5 pb-4">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle className="font-semibold tracking-[-0.01em] text-[#0F172A]">
            Create workspace
          </DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Create a shared space for your team.
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
            <FieldLabel htmlFor="workspace-name" className="gap-1">
              Workspace name
              <span className="text-[#EF4444]" aria-hidden="true">
                *
              </span>
            </FieldLabel>
            <Input
              id="workspace-name"
              name="title"
              value={title}
              placeholder="e.g. Machine Learning Project"
              autoComplete="off"
              autoFocus
              maxLength={WORKSPACE_TITLE_MAX}
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
              <FieldLabel htmlFor="workspace-description" className="w-auto">
                Description
              </FieldLabel>
              <span className="text-xs font-medium text-[#94A3B8]">
                Optional
              </span>
            </div>
            <Textarea
              id="workspace-description"
              name="description"
              value={description}
              placeholder="What is this workspace for?"
              rows={3}
              maxLength={WORKSPACE_DESCRIPTION_MAX}
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
        </FieldGroup>
        {apiError ? (
          <Alert
            variant="destructive"
            className="border-[#FECACA] bg-[#FEF2F2]"
          >
            <CircleAlert />
            <AlertTitle>Couldn&apos;t create the workspace</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
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
          Create workspace
        </Button>
      </DialogFooter>
    </form>
  )
}
