// api/tavus/conversations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[TAVUS] API invoked:', { method: req.method, url: req.url });
  if (req.method !== 'POST') {
    console.log('[TAVUS] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    conversation_name,
    conversational_context,
    properties,
    persona_id,
    replica_id,
  } = req.body;

  const apiKey = process.env.VITE_TAVUS_API_KEY;
  const apiUrl = process.env.VITE_TAVUS_API_URL || 'https://tavusapi.com/v2';
  const personaId = persona_id || process.env.VITE_TAVUS_PERSONA_ID;
  const replicaId = replica_id || process.env.VITE_TAVUS_REPLICA_ID;

  console.log('[TAVUS] Env:', { apiKey: !!apiKey, apiUrl, personaId, replicaId });
  console.log('[TAVUS] Request body:', req.body);

  try {
    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
      },
      body: JSON.stringify({
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name,
        conversational_context,
        properties,
      }),
    });

    const data = await response.json();
    console.log('[TAVUS] Tavus API response:', { status: response.status, data });
    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error('[TAVUS] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
