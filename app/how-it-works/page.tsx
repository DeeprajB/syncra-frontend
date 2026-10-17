import type { Metadata } from "next"

import { DiveIn, MarketingShell } from "@/components/landing/marketing-shell"

export const metadata: Metadata = {
  title: "How it works · Syncra",
  description:
    "How a student team starts in Syncra: sign in, create a workspace, invite people, add a project, and work on the shared board.",
}

const steps = [
  {
    title: "Sign in",
    body: "Syncra uses your existing login. After that, the dashboard is the list of workspaces you belong to.",
  },
  {
    title: "Create a workspace",
    body: "Name it after the class, the group, or the project. This is the space you will invite people into. You can keep more than one workspace if you are on more than one team.",
  },
  {
    title: "Invite the team",
    body: "Send an invite and choose a role. Members can create and move tasks. Viewers can read the board and the comments. Owners and admins can also look after members and the workspace itself.",
  },
  {
    title: "Add a project",
    body: "A project is one piece of work inside the workspace, such as an exhibition website or a shared report. Give it a name and a short description so the team knows what the board is for.",
  },
  {
    title: "Put the work on the board",
    body: "Add tasks into To do. Set a priority, assign someone, and add dates when they help. As the work moves, drag the card to In progress, Review, or Done. The person who created a task, and owners and admins, can remove it.",
  },
  {
    title: "Stay with the team while the work is open",
    body: "Open a task to read the description, leave a comment, and see the history. The activity page is there when you want the whole day in one list. If someone else is on the board, their name shows on the card or column they are using, and the Live mark shows who is in the workspace.",
  },
]

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
          How it works
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
          A first session with your team.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#475569]">
          Syncra is ready once the workspace exists and the board has the work
          on it. This is the path from an empty account to a project the group
          can share.
        </p>
        <ol className="mt-12 space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-heading text-2xl font-bold tracking-[-0.03em] text-[#CBD5E1]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#0F172A]">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#475569]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <DiveIn>Start a workspace</DiveIn>
        </div>
      </article>
    </MarketingShell>
  )
}
