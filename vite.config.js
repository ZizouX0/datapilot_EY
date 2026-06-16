import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serves POST /api/roadmap during `npm run dev` using the same core handler as
// the production serverless function. Keeps the Anthropic API key server-side.
function roadmapApiPlugin() {
  return {
    name: 'roadmap-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/roadmap', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const payload = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
          // Lazy import so the dev server boots even if the SDK isn't installed.
          const { generateRoadmapActions } = await import('./api/_roadmap-core.js')
          const result = await generateRoadmapActions(payload)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err) {
          res.statusCode = err.statusCode || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Failed to generate roadmap actions.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), roadmapApiPlugin()],
})
