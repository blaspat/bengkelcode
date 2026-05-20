import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

const gitCommit = execSync('git log -1 --format="%H"', { cwd: process.cwd() }).toString().trim()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit),
  },
  server: {
    allowedHosts: ['bengkel.spica.ooguy.com'],
  },
})
