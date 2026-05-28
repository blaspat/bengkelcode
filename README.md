# bengkelcode

> A browser-based developer workshop — a collection of tools that run entirely locally in your browser, with no data sent anywhere.

[Visit bengkelcode](https://bengkelcode.vercel.app)

## Tools

| Category | Tools |
|----------|-------|
| **Data** | JSON Linter, JSON → Java, XML Linter, YAML Converter |
| **Text** | Regex Generator, Diff Tool, Markdown Preview |
| **Encode** | Encryption (Base64, MD5, SHA-1, SHA-256, etc.), HTML URL Encoder |
| **Time** | Cron Maker, Epoch Converter |
| **Code** | SQL Formatter, JWT Decoder |
| **Utility** | QR Generator |

## Technical Overview

### Stack

- **Framework** — React 18 with hooks
- **Build** — Vite 8 with Rolldown for bundling
- **Styling** — Tailwind CSS with CSS custom properties for theming
- **Icons** — Lucide React

### Architecture

```
src/
├── App.jsx              # Main layout: sidebar, routing, state management
├── components/
│   ├── *.jsx            # One component per tool
│   ├── TextareaWithGutter.jsx   # Shared textarea with line numbers
│   ├── CollapsibleTree.jsx      # JSON tree view (JsonLinter)
│   └── XmlTree.jsx               # XML tree view (XmlLinter)
├── main.jsx
└── index.css            # Tailwind + CSS custom properties (theming)
```

### State Management

Each tool owns its own state via `useState`. The `App.jsx` root-level effect persists all tool states to `localStorage` under the key `bengkelcode-state-v1`. On cold start, if saved state exists, it is hydrated back into each tool — otherwise defaults are applied.

### Theming

CSS custom properties defined in `App.jsx` under `lightThemeVars` / `darkThemeVars`. The root `document.documentElement` is updated on theme change. Themes persist to `localStorage` under `bengkelcode-theme-v1`.

### Adding a New Tool

1. **Define the tool** in `App.jsx` categories array:
   ```jsx
   { id: 'my-tool', label: 'My Tool', icon: MyIcon }
   ```
2. **Add the state** and its setter (e.g., `const [myToolState, setMyToolState] = useState(...)`)
3. **Wire it in** the main content area:
   ```jsx
   {activeTab === 'my-tool' && <MyToolComponent state={myToolState} onStateChange={setMyToolState} onClear={clearAll} />}
   ```
4. **Extend persistence** — add `myTool: myToolState` to the `saveState` call and the `loadState` hydration.
5. **Reset in `clearAll`** — reset your state alongside the others.

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `bengkelcode-state-v1` | All tool states |
| `bengkelcode-sidebar-v1` | Sidebar collapsed state |
| `bengkelcode-theme-v1` | Light/dark theme |
| `bengkelcode-last-cat-v1` | Last open category + active tool |

## Development

```bash
pnpm install
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm preview  # Preview production build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, and how to add a tool.

## License

[MIT](LICENSE)
