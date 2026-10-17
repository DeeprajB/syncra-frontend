import Link from "next/link"
import { Activity, Bell, Kanban, MessageSquare } from "lucide-react"

import { FlashToast } from "@/components/flash-toast"
import { DiveIn, MarketingShell } from "@/components/landing/marketing-shell"
import { ProductPreview } from "@/components/landing/product-preview"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: Kanban,
    title: "A board for the project",
    description:
      "Each project is a board with To do, In progress, Review, and Done. Tasks carry a priority, an assignee, and dates.",
  },
  {
    icon: MessageSquare,
    title: "The discussion stays on the task",
    description:
      "Comments live on the piece of work they are about, so the decision is still there when someone opens the card later.",
  },
  {
    icon: Activity,
    title: "Catch up from the activity",
    description:
      "The workspace keeps a feed of what changed: tasks moved, comments added, people joining. Come back and read what you missed.",
  },
  {
    icon: Bell,
    title: "See who is here",
    description:
      "A name sits on the card or column a teammate is on. You also get a notification when work is assigned to you or someone comments on it.",
  },
]

const steps = [
  {
    number: "01",
    title: "Open a workspace",
    description:
      "A workspace is the team's home for one class, group, or project. Invite the people who are doing the work.",
  },
  {
    number: "02",
    title: "Add the project",
    description:
      "Create a project and put the work on the board. Assign tasks, set dates, and drag a card as it moves forward.",
  },
  {
    number: "03",
    title: "Work where everyone can see it",
    description:
      "Comment on the task, follow the activity, and notice who else is on the board with you.",
  },
]

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error)
    ? params.error[0]
    : params.error

  return (
    <MarketingShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-10 text-center md:px-8 md:pt-20">
        {callbackError ? (
          <FlashToast
            type="error"
            title="Could not finish sign in"
            description={callbackError}
            clearErrorParam
          />
        ) : null}

        <Badge
          variant="outline"
          className="h-auto gap-2 rounded-full border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#475569] uppercase"
        >
          <span className="size-1.5 rounded-full bg-[#6366F1]" />
          For student project teams
        </Badge>

        <h1 className="mt-6 max-w-3xl font-heading text-[2rem] leading-10 font-bold tracking-[-0.03em] text-balance text-[#0F172A] sm:text-5xl sm:leading-[56px]">
          One place for the project
          <span className="mt-1 block bg-gradient-to-r from-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent">
            your team is building.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-6 tracking-[-0.011em] text-pretty text-[#475569]">
          Syncra is a shared workspace for a class or group project. Plan the
          work on a board, talk on the task, and see which card your teammates
          are on.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <DiveIn />
          <Link
            href="/how-it-works"
            className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            See how a team uses it
          </Link>
        </div>

        <div className="mt-14 w-full text-left">
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
          What Syncra is
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
          The board, the conversation, and the people, in one workspace.
        </h2>
        <div className="mt-6 space-y-4 text-base leading-7 text-[#475569]">
          <p>
            A student team usually splits a project across chats, documents, and
            whoever remembers the list. Syncra holds that list as a board. The
            workspace belongs to the team. Inside it, each project has columns
            for work that is waiting, underway, ready for review, and finished.
          </p>
          <p>
            A task can name who owns it, how urgent it is, and when it is due.
            The comments stay on that task. When you return, the activity feed
            shows what moved, and your notifications tell you if something was
            assigned to you or someone replied on work you are part of.
          </p>
          <p>
            If a teammate is on the board at the same time, their name sits on
            the card or column they are looking at. You can see the work and the
            person, without asking where they are.
          </p>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-8 md:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
            What you can do
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
            Enough to run the project. Nothing extra to learn first.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] ring-0"
            >
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3B82F6]">
                  <feature.icon className="size-4" />
                </div>
                <CardTitle className="font-heading text-base font-semibold tracking-[-0.01em]">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm leading-5 text-[#475569]">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm">
          <Link
            href="/features"
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Read what each part is for
          </Link>
        </p>
      </section>

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 pb-20 md:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-[#0F172A] sm:text-4xl sm:leading-[44px]">
            From an empty workspace to a board the team shares.
          </h2>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
            >
              <p className="font-heading text-4xl font-bold tracking-[-0.03em] text-[#CBD5E1]">
                {step.number}
              </p>
              <h3 className="mt-4 font-heading text-base font-semibold tracking-[-0.01em] text-[#0F172A]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-[#475569]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm">
          <Link
            href="/how-it-works"
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Walk through the first session
          </Link>
        </p>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-8 md:py-24">
        <h2 className="font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
          Start the workspace for this project.
        </h2>
        <p className="mt-4 text-base text-[#475569]">
          Sign in, create the workspace, and invite the rest of the team.
        </p>
        <div className="mt-8 flex justify-center">
          <DiveIn>Open Syncra</DiveIn>
        </div>
      </section>
    </MarketingShell>
  )
}
