import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  LayoutGrid,
  Lock,
  Plus,
  RotateCw,
  Search,
  Settings,
  SignalHigh,
  UserRound,
  Users,
} from "lucide-react"

import { SyncraMark } from "@/components/syncra-mark"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Projects", icon: Folder, active: true },
  { label: "Members", icon: Users },
  { label: "Activity", icon: Activity },
  { label: "Settings", icon: Settings },
]

const priorityChip = {
  Low: "bg-[#F8FAFC] text-[#64748B]",
  Medium: "bg-[#F1F5F9] text-[#475569]",
  High: "bg-[#EEF2FF] text-[#4F46E5]",
  Urgent: "bg-[#FFF1F2] text-[#E11D48]",
}

const columns = [
  {
    title: "To do",
    dot: "bg-[#94A3B8]",
    count: 2,
    cards: [
      { title: "Write the artist bios", priority: "Medium", due: "Apr 18" },
      {
        title: "Book the catalogue print run",
        priority: "High",
        due: "Apr 12",
      },
    ],
  },
  {
    title: "In progress",
    dot: "bg-[#3B82F6]",
    count: 2,
    cards: [
      {
        title: "Design the exhibition homepage",
        priority: "High",
        due: "Apr 9",
        viewer: "Maya",
      },
      {
        title: "Confirm the opening-night order",
        priority: "Urgent",
        due: "Apr 4",
      },
    ],
  },
  {
    title: "Review",
    dot: "bg-[#8B5CF6]",
    count: 1,
    cards: [
      {
        title: "Proof the gallery floor plan",
        priority: "Medium",
        due: "Apr 2",
      },
    ],
  },
  {
    title: "Done",
    dot: "bg-[#10B981]",
    count: 1,
    cards: [
      {
        title: "Reserve the gallery weekend",
        priority: "Low",
        due: "Mar 20",
      },
    ],
  },
] as const

export function ProductPreview() {
  return (
    <figure className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)]">
      <figcaption className="sr-only">
        A browser window open on a Syncra board for a student exhibition
        website.
      </figcaption>
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
        <div className="flex items-center gap-1 text-[#94A3B8]" aria-hidden>
          <ChevronLeft className="size-4" />
          <ChevronRight className="size-4" />
          <RotateCw className="ml-1 size-3.5" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1">
          <Lock className="size-3 shrink-0 text-[#64748B]" aria-hidden />
          <p className="truncate font-mono text-[11px] text-[#475569]">
            syncra.example/dashboard/workspaces/studio-4/projects/spring-exhibition
          </p>
        </div>
      </div>

      <div className="border-b border-[#E2E8F0] bg-white">
        <div className="flex h-12 items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <SyncraMark className="size-6" />
            <span className="font-heading text-sm font-semibold tracking-[-0.01em] text-[#0F172A]">
              Syncra
            </span>
            <span className="hidden h-4 w-px bg-[#E2E8F0] sm:block" />
            <span className="hidden h-7 items-center gap-1.5 rounded-full border border-[#E2E8F0] px-2.5 text-xs font-medium text-[#0F172A] sm:inline-flex">
              Studio 4
              <ChevronDown className="size-3 text-[#94A3B8]" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg text-[#475569]">
              <Bell className="size-4" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-[#6366F1] text-[10px] font-semibold text-white">
              AR
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[180px_1fr]">
        <aside className="hidden border-r border-[#E2E8F0] bg-white p-3 md:block">
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Workspace navigation
          </p>
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#475569]",
                  item.active && "bg-[#3B82F6] text-white",
                  item.label === "Settings" &&
                    "mt-1 border-t border-[#E2E8F0] pt-2"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        <div className="relative bg-[#f8fafc] p-4">
          <p className="text-xs font-medium text-[#64748B]">
            Projects
            <span className="px-1.5 text-[#CBD5E1]">/</span>
            <span className="text-[#475569]">Spring exhibition site</span>
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold tracking-[-0.025em] text-[#0F172A]">
                  Spring exhibition site
                </h2>
                <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2 text-[11px] font-medium text-[#059669]">
                  <span className="size-1.5 rounded-full bg-[#10B981]" />
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">
                Publish the schedule, artist pages, and opening-night plan.
              </p>
            </div>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#3B82F6] px-2.5 text-xs font-semibold text-white">
              <Plus className="size-3.5" />
              Create task
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-sm font-medium text-[#0F172A]">
              <UserRound className="size-3.5 text-[#64748B]" />
              Assignee
              <ChevronDown className="size-3.5 text-[#94A3B8]" />
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-sm font-medium text-[#0F172A]">
              <SignalHigh className="size-3.5 text-[#64748B]" />
              Priority
              <ChevronDown className="size-3.5 text-[#94A3B8]" />
            </span>
            <span className="inline-flex h-8 min-w-40 flex-1 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-sm text-[#94A3B8]">
              <Search className="size-3.5" />
              Search tasks...
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => (
              <section
                key={column.title}
                className="rounded-2xl bg-[#F1F5F9] p-2.5"
              >
                <h3 className="flex items-center gap-2 px-1.5 py-1 text-sm font-semibold text-[#0F172A]">
                  <span className={cn("size-2 rounded-full", column.dot)} />
                  {column.title}
                  <span className="font-medium text-[#94A3B8]">
                    {column.count}
                  </span>
                </h3>
                <div className="mt-2 flex flex-col gap-2">
                  {column.cards.map((card) => (
                    <article
                      key={card.title}
                      className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      {"viewer" in card ? (
                        <span className="mb-2 inline-flex h-5 items-center gap-1 rounded-full border border-[#A5F3FC] bg-[#ECFEFF] pr-1.5 pl-0.5">
                          <span className="flex size-4 items-center justify-center rounded-full bg-[#06B6D4] text-[8px] font-semibold text-white">
                            M
                          </span>
                          <span className="text-[11px] font-medium text-[#0E7490]">
                            {card.viewer}
                          </span>
                        </span>
                      ) : null}
                      <p className="text-sm leading-5 font-semibold text-[#0F172A]">
                        {card.title}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
                            priorityChip[card.priority]
                          )}
                        >
                          {card.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                          <Calendar className="size-3.5" />
                          {card.due}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white py-1 pr-1.5 pl-2.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.45)]">
              <span className="size-2 rounded-full bg-[#06B6D4]" />
              <span className="text-xs font-medium text-[#475569]">Live</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-[#0EA5E9] text-[10px] font-semibold text-white ring-2 ring-[#06B6D4]">
                M
              </span>
            </span>
          </div>
        </div>
      </div>
    </figure>
  )
}
