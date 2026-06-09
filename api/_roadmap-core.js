// Framework-agnostic core for AI-personalized roadmap actions.
// Shared by the Vite dev middleware (local `npm run dev`) and the Vercel
// serverless function (`api/roadmap.js`) so there is exactly one code path.
//
// The Anthropic API key is read from the ANTHROPIC_API_KEY environment variable
// and never leaves the server. The SDK is imported lazily so the dev server and
// build still work when the dependency or key is absent — the feature simply
// degrades to the static recommendations on the client.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

const SYSTEM_PROMPT = `You are a data-governance advisor for Tunisian banks, working inside EY's DataPilot maturity tool. You write the "improvement roadmap" actions a bank must take to close maturity gaps.

Context:
- Maturity is scored 1.0–5.0 across 5 dimensions (Governance, Data Quality, Architecture & Access, Analytics & Tools, Skills & Culture).
- "BCT" = Banque Centrale de Tunisie. BCT-flagged items are regulatory obligations (e.g. Circulaire 2025-08, BCBS 239). Treat them as the highest priority and reference the relevant requirement when given.

For each sub-dimension you are given, write 2–3 concrete, specific, actionable recommendations to move it from its current score toward its target. Rules:
- Be specific to the gap and the named weaknesses — not generic advice.
- Each action is a single imperative sentence (start with a verb), max ~22 words.
- For sub-dimensions with regulatory (BCT) gaps, the FIRST action must directly remediate the regulatory requirement.
- Larger gaps warrant more foundational actions; small gaps warrant optimization/automation actions.
- No preamble, no numbering inside the strings.`;

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          sd: { type: 'string', description: 'The sub-dimension id, echoed back exactly.' },
          actions: {
            type: 'array',
            items: { type: 'string' },
            description: '2 to 3 recommended actions.',
          },
        },
        required: ['sd', 'actions'],
      },
    },
  },
  required: ['items'],
};

function buildUserPrompt({ bankName, targetLevel, items }) {
  const lines = items.map(it => {
    const bct = it.bctGaps && it.bctGaps.length
      ? ` | REGULATORY GAPS: ${it.bctGaps.map(g => `${g.ref} — "${g.q}"`).join('; ')}`
      : '';
    return `- [${it.sd}] ${it.dimName} › ${it.sdName} | current ${it.current.toFixed(2)} → target ${Number(targetLevel).toFixed(1)} (gap ${it.gap.toFixed(2)}, dimension weight ${Math.round(it.weight * 100)}%)${bct}`;
  });
  return `Bank: ${bankName || 'a Tunisian bank'}.
Target maturity level: ${Number(targetLevel).toFixed(1)}.
Write roadmap actions for each of the following ${items.length} sub-dimensions. Echo each sub-dimension id back in the "sd" field.

${lines.join('\n')}`;
}

/**
 * Generate tailored actions. Returns { items: [{ sd, actions }] }.
 * Throws an Error with a `.statusCode` property on configuration/API failure.
 */
export async function generateRoadmapActions(payload) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY is not configured on the server.');
    err.statusCode = 503;
    throw err;
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) return { items: [] };

  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch {
    const err = new Error('The @anthropic-ai/sdk package is not installed. Run `npm install`.');
    err.statusCode = 503;
    throw err;
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages: [{ role: 'user', content: buildUserPrompt(payload) }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Model returned no text content.');

  const parsed = JSON.parse(textBlock.text);
  // Normalize into a sd -> actions map for easy client consumption.
  const actionsBySd = {};
  for (const it of parsed.items || []) {
    if (it && it.sd && Array.isArray(it.actions)) {
      actionsBySd[it.sd] = it.actions.filter(a => typeof a === 'string' && a.trim()).slice(0, 3);
    }
  }
  return { actionsBySd, model: MODEL };
}
