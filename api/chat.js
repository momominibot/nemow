// Ovuluna · Luna Chat API — Volcengine Doubao Ark proxy
// Keeps the API key server-side, adds wellness system prompt,
// rate-limits per IP, and falls back to demo mode when no key.

const VOLCENGINE_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DEFAULT_MODEL = 'doubao-seed-1-6';
const MAX_TOKENS = 800;
const RATE_LIMIT_PER_MINUTE = 20;

// Simple in-memory rate limiter (per IP)
const rateMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;
  const hits = (rateMap.get(ip) || []).filter(t => t > windowStart);
  hits.push(now);
  rateMap.set(ip, hits);
  return hits.length <= RATE_LIMIT_PER_MINUTE;
}

// Demo-mode responses when no Volcengine API key is configured
const DEMO_RESPONSES = [
  "That's a great question! 🌙 In the full version, I'll connect to Doubao AI to give you a personalized answer based on your cycle data. For now, here's what I know: your cycle has four phases — menstrual, follicular, ovulation, and luteal. Each phase brings different energy, symptoms, and needs. Would you like to know more about a specific phase?",
  "I'd love to help with that! ✨ My AI brain is still waking up — the Volcengine API key needs to be added in the Vercel environment variables (VOLCENGINE_API_KEY). Once connected, I'll be able to analyze your cycle trends, explain symptoms, and give personalized wellness advice. In the meantime, remember: tracking your cycles consistently gives you the most powerful insights about your own body.",
  "Great question, lovely! 🌙 I'm running in demo mode right now because the AI API isn't connected yet. To activate my full brain, add your Volcengine Ark API key as VOLCENGINE_API_KEY in the project settings. I'm designed to be a gentle wellness companion — I'll never diagnose, but I can help you understand patterns, cite frameworks like STRAW+10, and suggest when to talk to a clinician. What else would you like to explore?",
];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }

  try {
    const { model, system, messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const apiKey = process.env.VOLCENGINE_API_KEY;

    // Demo mode: no API key configured
    if (!apiKey) {
      const reply = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
      return res.status(200).json({
        reply,
        model: 'demo-mode',
        demo: true,
      });
    }

    // Build the full message array with system prompt
    const fullMessages = [];
    if (system) {
      fullMessages.push({ role: 'system', content: system });
    }
    // Add user cycle context if available (from request body)
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        fullMessages.push({ role: msg.role, content: String(msg.content).slice(0, 2000) });
      }
    }

    // Call Volcengine Ark API
    const response = await fetch(VOLCENGINE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: fullMessages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'AI service error',
        detail: process.env.NODE_ENV === 'development' ? errorText : undefined,
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return res.status(200).json({
      reply,
      model: model || DEFAULT_MODEL,
      usage,
      demo: false,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
