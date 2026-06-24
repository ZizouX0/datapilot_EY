// Vercel-style serverless function for production deployments.
// Local development uses the equivalent Vite dev middleware in vite.config.js;
// both call the same manageUserCore().
import { manageUserCore } from './_manage-user-core.js';

function bearer(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await manageUserCore({
      token: bearer(req),
      action: payload.action,
      targetId: payload.targetId,
      title: payload.title,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to manage user.' });
  }
}
