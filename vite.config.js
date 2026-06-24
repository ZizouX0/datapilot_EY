import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Reads the JSON body of a dev-server request.
async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

// Serves POST /api/roadmap during `npm run dev` using the same core handler as
// the production serverless function. Keeps the Anthropic/AI key server-side.
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
          const payload = await readJsonBody(req)
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

// Serves POST /api/invite during `npm run dev` using the same core handler as
// the production serverless function. Uses the server-side service_role key.
function inviteApiPlugin() {
  return {
    name: 'invite-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/invite', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const payload = await readJsonBody(req)
          const auth = req.headers.authorization || ''
          const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
          const { inviteUserCore } = await import('./api/_invite-core.js')
          const result = await inviteUserCore({ token, email: payload.email, redirectTo: payload.redirectTo })
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err) {
          res.statusCode = err.statusCode || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Failed to invite user.' }))
        }
      })
    },
  }
}

// Serves POST /api/set-role during `npm run dev` using the same core handler as
// the production serverless function. Uses the server-side service_role key and
// enforces the role hierarchy in setRoleCore().
function setRoleApiPlugin() {
  return {
    name: 'set-role-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/set-role', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const payload = await readJsonBody(req)
          const auth = req.headers.authorization || ''
          const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
          const { setRoleCore } = await import('./api/_set-role-core.js')
          const result = await setRoleCore({ token, targetId: payload.targetId, role: payload.role })
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err) {
          res.statusCode = err.statusCode || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Failed to change role.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load .env (all keys, not just VITE_) and expose them to the dev-server
  // process so the API middlewares above can read server-side secrets like
  // SUPABASE_SERVICE_ROLE_KEY. In production these come from the host's env.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }

  return {
    plugins: [react(), tailwindcss(), roadmapApiPlugin(), inviteApiPlugin(), setRoleApiPlugin()],
  }
})
