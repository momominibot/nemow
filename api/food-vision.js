// /api/food-vision.js — Vercel serverless function
// Sends food photo to Volcengine Ark Vision API (Doubao-Seed-1.6)
// Uses credit card (85.6 x 54mm) as universal size reference for portion estimation

const VOLCENGINE_API_KEY = process.env.VOLCENGINE_API_KEY;
const ARK_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const MODEL = 'doubao-seed-1-6';

const SYSTEM_PROMPT = `You are Ovuluna's nutrition AI. Analyze the food photo and return STRICT JSON only.

A standard credit card (85.6mm x 53.98mm, ISO/IEC 7810 ID-1) may be placed next to the food as a size reference. Use it to estimate portion sizes accurately. If no credit card is visible, estimate based on common plate/utensil sizes and note "no reference object — estimate may be less accurate."

Return this exact JSON structure:
{
  "dishName": "identified dish name",
  "confidence": 0-100,
  "hasReferenceObject": true/false,
  "ingredients": [
    {
      "name": "ingredient name",
      "estimatedGrams": number,
      "calories": number (kcal),
      "protein": number (g),
      "carbs": number (g),
      "fat": number (g),
      "processedLevel": "minimal|light|processed|ultra",
      "notes": "brief note"
    }
  ],
  "totals": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "overallProcessedScore": 0-100 (100=least processed),
  "cyclePhaseTip": "one sentence advice for menstrual/follicular/ovulation/luteal phase",
  "warnings": ["any allergens or concerns"]
}

Be conservative with estimates. If the photo is unclear or food is not identifiable, return {"error": "Could not identify food. Please take a clearer photo in good lighting."}`;

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

  // Demo mode fallback (no API key)
  if (!VOLCENGINE_API_KEY) {
    return res.status(200).json({
      dishName: 'Demo Analysis',
      confidence: 0,
      hasReferenceObject: false,
      ingredients: [
        { name: 'Add your Volcengine API key to enable real food detection', estimatedGrams: 0, calories: 0, protein: 0, carbs: 0, fat: 0, processedLevel: 'minimal', notes: 'Demo mode' }
      ],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      overallProcessedScore: 0,
      cyclePhaseTip: 'Set VOLCENGINE_API_KEY in Vercel env to activate real food analysis.',
      warnings: ['Demo mode — no real analysis performed']
    });
  }

  try {
    const { image, cyclePhase = 'follicular' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Validate base64 size (max 10MB)
    const base64Size = image.length * 0.75;
    if (base64Size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Max 10MB.' });
    }

    const userPrompt = `Analyze this food photo. The user is currently in the ${cyclePhase} phase of their menstrual cycle. Provide a cycle-phase-specific nutrition tip.`;

    const response = await fetch(ARK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCENGINE_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine API error:', response.status, errorText);
      return res.status(502).json({ error: `Vision API error: ${response.status}`, details: errorText.slice(0, 200) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks)
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('JSON parse error:', e.message, 'Content:', content.slice(0, 300));
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content.slice(0, 500) });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Food vision handler error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
