<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI

This project uses **shadcn/ui** (`base-nova`, Base UI) and **lucide-react**.

- Import UI from `@/components/ui/*` (for example `import { Button, buttonVariants } from "@/components/ui/button"`).
- If a component is not in `components/ui`, add it with `bunx shadcn add <name>`. Do not invent primitives or copy Radix `asChild` patterns.
- Icons come from `lucide-react` first (`import { LogIn } from "lucide-react"`). Size them with `className="size-4"`. Only reach for another icon set if Lucide has no match.
- Style links as buttons with `buttonVariants()` on a native `<a>`. Do not wrap an `<a>` in `<Button>` — Base UI Button always sets `role="button"`.
- Auth0 routes (`/auth/login`, `/auth/logout`) must be native `<a>` tags, never Next.js `<Link>` with prefetch.
- Generated UI imports `cn` from `"cn"`. App code can use `@/lib/utils`.
- Show success, error, warning, and info with the shadcn toaster: `Toaster` from `@/components/ui/sonner` and `toast` from `sonner`. Do not leave those messages inline on the page.
- Keep `/` public and `/dashboard` auth-protected. This app stays on `middleware.ts` (Edge) for Cloudflare/OpenNext — do not migrate to `proxy.ts`.
