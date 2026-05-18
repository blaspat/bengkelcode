# bengkelcode v1 — Spec

**Date:** 2026-05-18
**Status:** Ready for Kate
**Project Folder:** `kate/workspace/projects/bengkelcode/`

---

## Overview

bengkelcode is a developer utility web app that bundles common dev tools in one place. No account needed, no server costs — pure client-side v1.

**v1 only:** Three tools, all browser-side. Backend (Go + Redis) added in v2 for notes/file sharing.

---

## Name

**bengkelcode** — confirmed
- "Bengkel" = Indonesian for workshop
- "Code" = developer
- Tagline: "workshop for developers"
- Logo: wrench + code bracket icon, coral orange (#F97316)

---

## Tech Stack

- **Frontend:** Vite + React + Tailwind CSS + Lucide Icons
- **Hosting:** Static files — GitHub Pages, Cloudflare Pages, or Netlify (free)
- **No backend for v1**

---

## Tools (v1)

### 1. JSON Linter

- Textarea input for raw JSON
- "Lint" button
- Valid JSON → success message + formatted/beautified output
- Invalid JSON → error message with line number and column
- "Copy" button to copy formatted result
- "Clear" button to reset

### 2. XML Linter

- Textarea input for raw XML
- "Lint" button
- Valid XML → success message + formatted/beautified output
- Invalid XML → error message with line number and column
- "Copy" button to copy formatted result
- "Clear" button to reset

### 3. Cron Maker

- Visual cron expression builder (minute, hour, day, month, weekday pickers)
- Live preview showing next 5 execution times
- Manual expression input field (bidirectional sync with visual builder)
- Validation: reject invalid expressions with clear error
- "Copy" button to copy expression

---

## Design Direction

**Theme:** Minimalist modern, white background, clean lines
**Accent:** Coral orange (#F97316)
**Typography:** Monospace for code areas, clean sans-serif for UI
**Layout:** Tab bar at top, split view (input left, output right), floating action buttons
**Style:** iOS app-like simplicity, European minimal design, no heavy borders/shadows
**Logo:** Wrench + code bracket icon in coral orange

---

## UI/UX

- Single-page app, tab navigation to switch between 3 tools
- Split view: raw code input (left) → formatted output (right)
- Minimal text labels, clean iconography
- Floating action buttons (bottom-right corner)
- Dark/light mode toggle (nice to have, not blocker)
- Error states: red highlight + clear error message
- Success states: green checkmark + formatted output
- Responsive: works on desktop and mobile

---

## Not in v1

- Backend (Go API + Redis) — comes in v2
- Notes sharing
- File sharing
- User accounts / OAuth
- Ad integration
- Landing page

---

## Acceptance Criteria

- [ ] JSON Linter: validates and formats JSON correctly
- [ ] JSON Linter: shows line/column for errors
- [ ] XML Linter: validates and formats XML correctly
- [ ] XML Linter: shows line/column for errors
- [ ] Cron Maker: builds valid cron expressions
- [ ] Cron Maker: shows next 5 run times
- [ ] Cron Maker: validates and rejects invalid expressions
- [ ] All tools: copy to clipboard works
- [ ] All tools: clear/reset works
- [ ] Responsive on mobile
- [ ] Builds and deploys as static site

---

## Notes for Kate

- Start with the project scaffold (Vite + React + Tailwind)
- Build JSON Linter first as reference implementation
- XML Linter follows identical pattern
- Cron Maker is slightly different — needs bidirectional sync between picker UI and expression field
- No API calls in v1 — all logic client-side
- Use established libraries where sensible (e.g., cron parser for cron maker)