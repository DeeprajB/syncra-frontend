---
name: Synchronous Kinetic Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#424754'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#006577'
  on-tertiary: '#ffffff'
  tertiary-container: '#008096'
  on-tertiary-container: '#f9fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for high-velocity university student teams, research cohorts, and technical student organizations demanding an engineering-grade, professional workspace. The interface removes friction, elevates academic collaboration, and bridges the gap between chaotic group assignments and the refined workflow of elite product engineering teams.

### Brand Personality & Tone
- **Precision-Driven & Focused:** Clean information density inspired by modern developer platforms (such as Linear and Notion Enterprise), favoring clarity and immediate utility over superfluous decoration.
- **Academic Ambition:** Professional and mature without feeling bureaucratic. It instills confidence, momentum, and accountability within ambitious multi-disciplinary teams.
- **Kinetic & Cohesive:** Anchored by the vibrant interlocking identity, the experience emphasizes synchronization, real-time collaboration, and fluid transitions between ideation, task management, and execution.

### Design Movement: Modern Technical SaaS
The visual language merges crisp corporate modernism with high-density technical minimalism:
- **Pristine Surfaces:** Ultra-light, sterile canvases (#F8FAFC and pure #FFFFFF) providing high legibility and visual calm during intensive sprints.
- **Disciplined Micro-Borders:** Strict 1px structural framing (#E2E8F0) replaces heavy elevation and visual clutter, anchoring modular panels and real-time kanban boards.
- **Targeted Spectrum Accents:** High-chroma violet-to-blue-to-cyan gradients drawn from the mark are used exclusively for primary calls-to-action, active presence indicators, focus highlights, and progress milestones, keeping the base UI quiet, functional, and razor-sharp.

## Colors

The color system delivers high readability, accessible contrast, and precise visual communication across dense collaborative surfaces.

### Core Hierarchy
- **Primary (`#3B82F6`):** Precision Blue. Used for interactive states, key system actions, focused borders, active tab highlights, and primary selection states.
- **Secondary (`#6366F1`):** Electric Violet. Represents creative collaboration, automated workflows, synchronized live edits, and milestone flags. Pairs with the primary in linear gradients (`linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #06B6D4 100%)`).
- **Tertiary (`#06B6D4`):** Real-Time Cyan. Reserved for live presence indicators, real-time user avatars, active sprint markers, and completed states.
- **Neutral (`#0F172A`):** Deep Navy/Slate. Supplies bedrock typographic contrast for primary headings, body copy, and high-impact micro-badges.

### Canvas & Surface Architecture
- **Base Canvas (`#F8FAFC`):** Soft, neutral cool grey-white that reduces eye fatigue across extensive planning sessions.
- **Surface Elevation (`#FFFFFF`):** Work cards, modal dialogs, flyout menus, and table rows elevate against the base canvas via crisp separation.
- **Subtle Surface (`#F1F5F9`):** Sub-tables, code blocks, keyboard shortcut tags, and inactive chip backgrounds.
- **Border Default (`#E2E8F0`):** Neutral division lines, cell delimiters, and panel outlines.
- **Border Focused (`#3B82F6`):** Immediate 1px or 2px active indicator for inputs, selected cards, and active cell cursors.

### Functional Status Indicators
- **Success / On-Track:** `#10B981` (Emerald) with soft `#ECFDF5` background.
- **Warning / At-Risk:** `#F59E0B` (Amber) with soft `#FFFBEB` background.
- **Error / Blocker:** `#EF4444` (Rose) with soft `#FEF2F2` background.
- **Informational / Syncing:** `#3B82F6` (Precision Blue) with soft `#EFF6FF` background.

## Typography

The typographic pairing provides high information throughput and refined modern aesthetic value.

### Font Roles
- **Headlines & Section Titles (Plus Jakarta Sans):** Geometric yet friendly, lending an energetic, contemporary, and confident posture to workspace headers, project boards, and dashboard metrics. Tight letter tracking (`-0.025em` to `-0.01em`) maintains visual cohesion at larger sizes.
- **Interface, Data & Body (Inter):** Industrial-grade legibility for high-density tables, multi-nested task trees, ticket descriptions, and metadata. Open apertures and tall x-height allow comfortable long-form scanning under intense workloads.
- **Mono / Technical Metadata (JetBrains Mono):** Applied sparingly to git commit hashes, sprint metrics, issue IDs (e.g., `SYNC-1042`), and shortcut tooltips.

### Hierarchy & Usage Rules
- `display` and `headline-lg` are dedicated to major overview hubs, onboarding screens, and sprint completion states.
- `title-md` and `title-sm` handle modal titles, card headers, board column labels, and navigation nodes.
- `body-md` is the primary workhorse for task descriptions, document blocks, and comments.
- `label-sm` is rendered in uppercase with subtle tracking for table headers, issue tags, and workflow status pills.

## Layout & Spacing

The layout philosophy is founded on an engineering-grade modular grid built on a strict 4px/8px baseline rhythm.

### Grid Architecture & Form Factors
- **Desktop (1280px+):** Fluid collapsible sidebar navigation (240px wide or 56px icon-rail), with main content conforming to a flexible multi-column workspace or kanban matrix. Column gutters sit at `1.5rem` (`gutter-desktop`) with outer canvas margin fixed at `2rem` (`margin-desktop`).
- **Tablet (768px - 1279px):** Sidebar collapses to an overlay drawer. Kanban columns scroll horizontally on a native snap-axis. Outer margins compress to `1.5rem` (`margin-tablet`), gutters standardise at `1rem`.
- **Mobile (< 768px):** Single-column vertical stack with persistent bottom command bar. Board views switch from multi-column drag layouts to segmented tab views. Outer padding sits at `1rem` (`margin`).

### Spacing Density Principles
- **Micro-Gaps (`space-2xs`, `space-xs`, `space-sm`):** Reserved for button internals, avatar stacks, inline badge padding, and icon-to-label spacing.
- **Component Padding (`space-md`, `space-base`):** Structural internal padding for task cards, input fields, dropdown menus, and list rows.
- **Section & Panel Divisors (`space-lg`, `space-xl`):** Dedicated distance between independent widget blocks, board columns, and document canvas sections.

## Elevation & Depth

This design system rejects heavy blur glassmorphism and deep skeuomorphic shadows in favor of crisp architectural separation, razor-thin micro-borders, and tactile ambient lighting.

### Layering Philosophy
- **Level 0 (Base Canvas):** Background tone `#F8FAFC`. Zero elevation. Provides an unadorned stage.
- **Level 1 (Structural Containers & Cards):** Pure `#FFFFFF` surface bordered by a continuous 1px solid stroke in `#E2E8F0`. Depth is communicated primarily through outline definition, supplemented by a subtle diffuse ambient drop:
  `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);`
- **Level 2 (Hovered Cards & Interactive Nodes):** Subtle rise on hover. Micro-border darkens to `#CBD5E1`, with elevation intensifying slightly:
  `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04);`
- **Level 3 (Dropdowns, Popovers, & Flyouts):** High-precision overlays floating above context:
  `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);`
  Border remains 1px solid `#E2E8F0`.
- **Level 4 (Modals & Command Palettes):** Centered floating dialogs framed with `#E2E8F0` backed by an ultra-clean `#0F172A` backdrop mask at `40%` opacity:
  `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04);`

### Multi-User Real-Time Presence
Live co-presence avoids heavy colored shadows. Instead, it utilizes sharp 2px solid rings in the peer's assigned user color (`#6366F1`, `#3B82F6`, `#06B6D4`, `#10B981`) directly around cards, text selections, or cursor points, accompanied by an offset pill avatar.

## Shapes

The geometric personality of this design system is balanced at **Roundedness: 2** (0.5rem base radius). It mirrors the rounded hexagonal geometry of the interlocking brandmark while retaining the structured discipline required for technical SaaS tools.

### Radius Scale Implementation
- **Small Controls & Tags (`rounded-sm` / 0.25rem - 4px):** Checkboxes, inline code badges, status pips, and keycap (`kbd`) tags.
- **Base Components (`rounded` / 0.5rem - 8px):** Primary buttons, input text boxes, select dropdowns, task list items, and interactive chips.
- **Containers & Surface Panels (`rounded-lg` / 1rem - 16px):** Kanban column shells, dashboard cards, modal bodies, and sidebar floating panels.
- **Outer Shells & Promos (`rounded-xl` / 1.5rem - 24px):** Workspace setup wizards, milestone highlight cards, and empty-state containers.
- **Pill Geometry (`rounded-full` / 9999px):** User avatars, active collaboration badges, priority tags, and command-bar triggers.

## Components

### Buttons
- **Primary:** Filled `#3B82F6` (or brand gradient `linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)` for high-impact actions like "New Sprint" or "Deploy"). White `#FFFFFF` Inter 14px bold text, `0.5rem` radius, padding `0.5rem 1rem`. Sub-pixel inset shadow for a tactile edge: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(15, 23, 42, 0.05)`. Hover: `#2563EB`.
- **Secondary / Outline:** Background `#FFFFFF`, 1px solid border in `#E2E8F0`, text `#0F172A`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Ghost:** Transparent background, text `#475569`. Hover: background `#F1F5F9`, text `#0F172A`.
- **Icon / Action Item:** Fixed 32x32px square with `0.5rem` radius, centered SVG icon (16px), subtle `#E2E8F0` hover outline.

### Input Fields & Controls
- **Text Inputs:** Height 36px, background `#FFFFFF`, border 1px solid `#E2E8F0`, text `#0F172A`, placeholder `#94A3B8`. Padding `0.5rem 0.75rem`. Focus: border `#3B82F6` with a crisp `0 0 0 1px #3B82F6` ring.
- **Search & Quick-Command:** Input with integrated prefix icon and trailing keyboard shortcut tag (`⌘K`) wrapped in `#F1F5F9` border-radius 4px container.

### Chips, Badges & Tags
- **Status Pills:** Height 22px, padding `0.125rem 0.5rem`, rounded-full. Semantic styling:
  - *Backlog / Todo:* Background `#F1F5F9`, text `#475569`, border `#E2E8F0`.
  - *In Progress:* Background `#EFF6FF`, text `#1D4ED8`, border `#BFDBFE`.
  - *In Review:* Background `#EEF2FF`, text `#4338CA`, border `#C7D2FE`.
  - *Completed:* Background `#ECFDF5`, text `#047857`, border `#A7F3D0`.
- **Assignee Avatar Stacks:** Overlapping 24px circles with 2px white borders. Active editing peer displays an animated 2px pulsing cyan (`#06B6D4`) indicator.

### Checkboxes & Radios
- **Checkboxes:** 16x16px, 4px corner radius. Unchecked: border 1.5px solid `#CBD5E1`, background `#FFFFFF`. Checked: solid `#3B82F6` with white SVG checkmark. Smooth micro-scale transition (0.95 to 1.0).
- **Radio Buttons:** 16x16px circle with centered 6px dot when selected.

### Cards & Task Rows
- **Kanban Task Card:** Surface `#FFFFFF`, border 1px solid `#E2E8F0`, padding `0.75rem`, radius `0.5rem`. Contains issue key (JetBrains Mono 11px), task title (Inter 14px 500 weight), tag chips, assignee stack, and priority icon. Hover: border `#CBD5E1` and subtle lift.
- **List / Table Row:** 40px height, bordered on bottom by 1px `#F1F5F9`. Hover activates an instantaneous full-width row background in `#F8FAFC`.

### Specialized Platform Components
- **Real-Time Cursor Presence:** SVG cursor tinted to user color with attached micro-pill label containing the student's name in 10px white text.
- **Quick-Switch Command Palette (`⌘K`):** Centered floating overlay, width 580px, backdrop blur 4px with `#0F172A` at 30% opacity. Rapid keyboard-driven list navigation using `#3B82F6` item selection backgrounds at 10% opacity.