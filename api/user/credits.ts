import { supabase } from '../../src/lib/supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Portable serverless API route to get user credits from Supabase
interface UserCredits {
    credits: number;
}

interface ErrorResponse {
    error: string;
}

interface CreditsResponse {
    credits: number;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    try {
        const { data, error } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ credits: data.credits });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
}
