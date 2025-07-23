// api/tavus/conversations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optionally, you can extract more fields from req.body as needed
  const { conversation_name, conversational_context, properties } = req.body;

  const apiKey = process.env.VITE_TAVUS_API_KEY;
  const apiUrl = process.env.VITE_TAVUS_API_URL;
  const personaId = process.env.VITE_TAVUS_PERSONA_ID;

  try {
    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        persona_id: personaId,
        conversation_name,
        conversational_context,
        properties,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
