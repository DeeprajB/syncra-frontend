"use client"

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { useRouter } from "next/navigation"
import { CircleAlert } from "lucide-react"
import { toast } from "sonner"

import {
  archiveWorkspace,
  leaveWorkspace,
  removeMember,
  updateMemberRole,
  updateWorkspace,
  type UpdateWorkspaceState,
} from "@/app/dashboard/workspace-actions"
import { MemberRow } from "@/components/dashboard/member-row"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  canEditWorkspace,
  canRemoveMember,
  isAssignableRole,
  roleLabel,
  WORKSPACE_DESCRIPTION_MAX,
  WORKSPACE_TITLE_MAX,
  type AssignableRole,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceRole,
} from "@/lib/workspaces"

const initialState: UpdateWorkspaceState = { status: "idle" }

const roleItems: { value: AssignableRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
]

export function WorkspaceSettings({
  workspace,
  members,
  membersError,
  currentRole,
  currentUserId,
}: {
  workspace: Workspace
  members: WorkspaceMember[]
  membersError?: string
  currentRole?: WorkspaceRole
  currentUserId?: string
}) {
  const canEdit = currentRole ? canEditWorkspace(currentRole) : true

  const memberCount = members.length

  return (
    <main className="@container flex flex-1 flex-col px-6 py-6 lg:px-8">
      <div>
        <h1 className="font-heading text-[1.75rem] leading-9 font-bold tracking-[-0.025em] text-[#0F172A]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Preferences for {workspace.title}.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 @min-[760px]:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <WorkspaceDetails workspace={workspace} canEdit={canEdit} />

        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">Members</h2>
              <p className="mt-0.5 text-sm text-[#64748B]">
                People with access to this workspace.
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-5 rounded-full border-[#E2E8F0] bg-[#F8FAFC] px-2 text-[11px] font-semibold text-[#64748B]"
            >
              {membersError ? "—" : memberCount}
            </Badge>
          </div>
          {membersError ? (
            <p className="px-5 py-4 text-sm text-[#64748B]">{membersError}</p>
          ) : (
            <ul className="divide-y divide-[#E2E8F0]">
              {members.map((member) => (
                <li key={member.id}>
                  <SettingsMember
                    workspaceId={workspace.id}
                    member={member}
                    currentRole={currentRole}
                    currentUserId={currentUserId}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {currentRole === "owner" ? (
        <DangerAction
          title="Archive workspace"
          description="Hides this workspace for every member. You can't restore it from here."
          confirmTitle="Archive this workspace?"
          confirmDescription={`${workspace.title} will disappear for the whole team.`}
          confirmLabel="Archive workspace"
          action={() => archiveWorkspace(workspace.id)}
          successMessage="Workspace archived"
        />
      ) : null}

      {currentRole && currentRole !== "owner" ? (
        <DangerAction
          title="Leave workspace"
          description="You'll lose access until someone invites you again."
          confirmTitle="Leave this workspace?"
          confirmDescription={`You'll be removed from ${workspace.title}.`}
          confirmLabel="Leave workspace"
          action={() => leaveWorkspace(workspace.id)}
          successMessage="You left the workspace"
        />
      ) : null}
    </main>
  )
}

function WorkspaceDetails({
  workspace,
  canEdit,
}: {
  workspace: Workspace
  canEdit: boolean
}) {
  const router = useRouter()
  const [title, setTitle] = useState(workspace.title)
  const [description, setDescription] = useState(workspace.description ?? "")
  const [state, formAction, pending] = useActionState(
    updateWorkspace,
    initialState
  )
  const [trackedState, setTrackedState] = useState(state)
  const [cleared, setCleared] = useState({
    title: false,
    description: false,
    api: false,
  })
  const toasted = useRef(state)

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
    if (state.status !== "success" || toasted.current === state) {
      return
    }

    toasted.current = state
    toast.success("Workspace updated", {
      id: "update-workspace",
      description: state.title,
    })
    router.refresh()
  }, [router, state])

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="border-b border-[#E2E8F0] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#0F172A]">Workspace</h2>
        <p className="mt-0.5 text-sm text-[#64748B]">
          The name and description your team sees.
        </p>
      </div>
      {canEdit ? (
        <form action={formAction} noValidate className="px-5 py-4">
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <FieldGroup className="gap-4">
            <Field data-invalid={titleError ? true : undefined}>
              <FieldLabel htmlFor="settings-workspace-name">Name</FieldLabel>
              <Input
                id="settings-workspace-name"
                name="title"
                value={title}
                maxLength={WORKSPACE_TITLE_MAX}
                disabled={pending}
                aria-invalid={titleError ? true : undefined}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setCleared((current) => ({ ...current, title: true }))
                }}
                className="h-9 bg-white"
              />
              <FieldError>{titleError}</FieldError>
            </Field>
            <Field data-invalid={descriptionError ? true : undefined}>
              <FieldLabel htmlFor="settings-workspace-description">
                Description
              </FieldLabel>
              <Textarea
                id="settings-workspace-description"
                name="description"
                value={description}
                rows={3}
                maxLength={WORKSPACE_DESCRIPTION_MAX}
                disabled={pending}
                aria-invalid={descriptionError ? true : undefined}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setCleared((current) => ({ ...current, description: true }))
                }}
                className="min-h-20 bg-white"
              />
              <FieldError>{descriptionError}</FieldError>
            </Field>
            {apiError ? (
              <Alert
                variant="destructive"
                className="border-[#FECACA] bg-[#FEF2F2]"
              >
                <CircleAlert />
                <AlertTitle>Couldn&apos;t update the workspace</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
              >
                {pending ? <Spinner /> : null}
                Save changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      ) : (
        <dl className="divide-y divide-[#E2E8F0]">
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline">
            <dt className="text-sm text-[#64748B]">Name</dt>
            <dd className="text-sm font-medium text-[#0F172A]">
              {workspace.title}
            </dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline">
            <dt className="text-sm text-[#64748B]">Description</dt>
            <dd className="text-sm text-[#0F172A]">
              {workspace.description || "No description yet."}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}

function SettingsMember({
  workspaceId,
  member,
  currentRole,
  currentUserId,
}: {
  workspaceId: string
  member: WorkspaceMember
  currentRole?: WorkspaceRole
  currentUserId?: string
}) {
  const router = useRouter()
  const [role, setRole] = useState<AssignableRole | "owner">(member.role)
  const [pending, startTransition] = useTransition()
  const canAssign =
    currentRole === "owner" && member.role !== "owner" && role !== "owner"
  const canRemove =
    currentRole && currentUserId
      ? canRemoveMember(currentRole, currentUserId, member)
      : false

  return (
    <MemberRow
      flush
      member={member}
      action={
        <div className="flex shrink-0 items-center gap-2">
          {canAssign ? (
            <Select
              value={role}
              items={roleItems}
              disabled={pending}
              onValueChange={(value) => {
                if (!value || !isAssignableRole(value) || value === role) {
                  return
                }

                const previous = role
                setRole(value)
                startTransition(async () => {
                  const result = await updateMemberRole(
                    workspaceId,
                    member.id,
                    value
                  )
                  if (!result.ok) {
                    setRole(previous)
                    toast.error(result.message)
                    return
                  }

                  toast.success(`${member.name} is now ${roleLabel(value)}`)
                  router.refresh()
                })
              }}
            >
              <SelectTrigger className="w-28 bg-white" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="syncra-canvas bg-white">
                <SelectGroup>
                  {roleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-[#E2E8F0] bg-white px-2 text-[11px] font-medium text-[#475569]"
            >
              {roleLabel(member.role)}
            </Badge>
          )}
          {canRemove ? (
            <ConfirmButton
              label="Remove"
              title={`Remove ${member.name}?`}
              description="They will lose access until someone invites them again."
              confirmLabel="Remove"
              pendingLabel="Removing"
              disabled={pending}
              action={() => removeMember(workspaceId, member.id)}
              onSuccess={() => {
                toast.success(`${member.name} was removed`)
                router.refresh()
              }}
            />
          ) : null}
        </div>
      }
    />
  )
}

function DangerAction({
  title,
  description,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  action,
  successMessage,
}: {
  title: string
  description: string
  confirmTitle: string
  confirmDescription: string
  confirmLabel: string
  action: () => Promise<{ ok: true } | { ok: false; message: string }>
  successMessage: string
}) {
  const router = useRouter()

  return (
    <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[#0F172A]">{title}</h2>
        <p className="mt-0.5 max-w-xl text-sm text-[#64748B]">{description}</p>
      </div>
      <ConfirmButton
        appearance="quiet"
        label={confirmLabel}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        pendingLabel="Working"
        action={action}
        onSuccess={() => {
          toast.success(successMessage)
          router.push("/dashboard")
        }}
      />
    </section>
  )
}

function ConfirmButton({
  label,
  title,
  description,
  confirmLabel,
  pendingLabel,
  action,
  onSuccess,
  disabled,
  appearance = "solid",
}: {
  label: string
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
  action: () => Promise<{ ok: true } | { ok: false; message: string }>
  onSuccess: () => void
  disabled?: boolean
  appearance?: "solid" | "quiet"
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={appearance === "quiet" ? "outline" : "destructive"}
            size={appearance === "quiet" ? "lg" : "sm"}
            disabled={disabled || pending}
            className={
              appearance === "quiet"
                ? "h-9 border-[#FECACA] bg-white px-3 font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                : undefined
            }
          />
        }
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent className="syncra-canvas bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await action()
                if (!result.ok) {
                  toast.error(result.message)
                  return
                }

                setOpen(false)
                onSuccess()
              })
            }}
          >
            {pending ? <Spinner /> : null}
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
