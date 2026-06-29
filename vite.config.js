import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
let gitCommit = 'unknown'
try {
  const { execSync } = await import('child_process')
  gitCommit = execSync('git log -1 --format="%H"', { cwd: process.cwd() }).toString().trim()
} catch { /* git not available (Vercel, shallow clone, etc.) */ }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit),
  },
})
