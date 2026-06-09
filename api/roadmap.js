// Vercel-style serverless function for production deployments.
// Local development uses the equivalent Vite dev middleware in vite.config.js;
// both call the same generateRoadmapActions() core.
import { generateRoadmapActions } from './_roadmap-core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    // Vercel parses JSON bodies automatically; fall back for other runtimes.
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await generateRoadmapActions(payload || {});
    res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to generate roadmap actions.' });
  }
}
