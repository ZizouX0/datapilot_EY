// Framework-agnostic core for AI-personalized roadmap actions.
// Shared by the Vite dev middleware (local `npm run dev`) and the Vercel
// serverless function (`api/roadmap.js`) so there is exactly one code path.
//
// Provider-agnostic: talks to any OpenAI-compatible /chat/completions endpoint.
// Defaults to Google Gemini's free tier. Switch to Groq / OpenRouter / etc. by
// changing AI_BASE_URL + AI_MODEL + AI_API_KEY — no code change required.
//
// The API key is read from the environment server-side and never reaches the
// browser. When unset, the endpoint returns 503 and the client falls back to
// the built-in static recommendations.

const API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
const BASE_URL = (process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai').replace(/\/$/, '');
const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are a data-governance advisor for Tunisian banks, working inside EY's DataPilot maturity tool. You write the "improvement roadmap" actions a bank must take to close maturity gaps.

Context:
- Maturity is scored 1.0–5.0 across the bank's weighted data dimensions (typically Governance, Data Quality, Architecture & Access, Analytics & Tools, Skills & Culture). The exact dimensions and sub-dimensions are provided in the request.
- "BCT" = Banque Centrale de Tunisie. BCT-flagged items are regulatory obligations (e.g. Circulaire 2025-08, BCBS 239). Treat them as the highest priority and reference the relevant requirement when given.

For each sub-dimension you are given, write 2–3 concrete, specific, actionable recommendations to move it from its current score toward its target. Rules:
- Be specific to the gap and the named weaknesses — not generic advice.
- Each action is a single imperative sentence (start with a verb), max ~22 words.
- For sub-dimensions with regulatory (BCT) gaps, the FIRST action must directly remediate the regulatory requirement.
- Larger gaps warrant more foundational actions; small gaps warrant optimization/automation actions.
- No preamble, no numbering inside the strings.

Return ONLY valid JSON, no markdown fences, of exactly this shape:
{"items":[{"sd":"<sub-dimension id, echoed exactly>","actions":["action 1","action 2"]}]}`;

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

// Strip accidental ```json fences some models add around JSON.
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
}

/**
 * Generate tailored actions. Returns { actionsBySd, model }.
 * Throws an Error with a `.statusCode` property on configuration/API failure.
 */
export async function generateRoadmapActions(payload) {
  if (!API_KEY) {
    const err = new Error('No AI key configured. Set GEMINI_API_KEY (or AI_API_KEY) on the server.');
    err.statusCode = 503;
    throw err;
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) return { actionsBySd: {}, model: MODEL };

  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
      }),
    });
  } catch (e) {
    const err = new Error(`Could not reach the AI provider: ${e.message}`);
    err.statusCode = 502;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const err = new Error(`AI provider returned ${response.status}: ${body.slice(0, 300)}`);
    err.statusCode = response.status === 429 ? 429 : 502;
    throw err;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI provider returned no content.');

  let parsed;
  try {
    parsed = JSON.parse(extractJson(content));
  } catch {
    throw new Error('AI response was not valid JSON.');
  }

  const actionsBySd = {};
  for (const it of parsed.items || []) {
    if (it && it.sd && Array.isArray(it.actions)) {
      actionsBySd[it.sd] = it.actions.filter(a => typeof a === 'string' && a.trim()).slice(0, 3);
    }
  }
  return { actionsBySd, model: MODEL };
}
