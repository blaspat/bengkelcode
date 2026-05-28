# Contributing to Bengkelcode

Welcome! Bengkelcode is a developer toolbox — a collection of utilities for common coding tasks. Contributions are welcome.

## Quick Start

```bash
git clone https://github.com/blaspat/bengkelcode.git
cd bengkelcode
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) — it runs on port 5173.

## Project Structure

```
src/
  App.jsx            — main app shell, routing, state management
  index.css          — Tailwind + CSS variables (theme system)
  components/
    JsonLinter.jsx   — JSON format/compact/compare + tree view
    Encryption.jsx    — Base64, URL, HTML, MD5, SHA-1/256/512
    CronMaker.jsx     — cron expression builder
    DiffTool.jsx      — side-by-side diff
    ...               — one component per tool
```

## Adding a New Tool

1. **Create the component** in `src/components/`
2. **Register it in `App.jsx`**:
   - Import it at the top
   - Add it to the `categories` list (find the right category or create one)
   - Add its state: `const [myToolState, setMyToolState] = useState(...)`
   - Add it to the `saveState` / `loadState` persistence
   - Add it to the `clearAll` handler
   - Add it to the `saveState` effect dependencies
3. **Add icons** from `lucide-react`
4. **Persist state** if your tool has input/output — follow the pattern of existing tools

## Code Style

- React functional components with hooks
- CSS variables for theming (see `App.jsx` `lightThemeVars` / `darkThemeVars`)
- No hardcoded colors — use `var(--accent)`, `var(--bg)`, `var(--text)`, etc.
- `useCallback` for event handlers passed to children
- Mobile-first responsive design (breakpoint: 768px)

## Commit Format

```
type: short description

feat: new tool or major feature
fix: bug fix
refactor: code restructure without behavior change
docs: documentation only
chore: tooling, dependencies, config
```

## Notes

- The app supports light and dark themes via CSS variables
- All tool states are persisted to `localStorage` under `bengkelcode-state-v1`
- Dev server is configured to allow host `bengkel.spica.ooguy.com`
- No backend — fully client-side
