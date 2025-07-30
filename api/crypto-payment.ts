

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Chain config: add more as needed
const CHAIN_CONFIG: Record<string, { rpcUrl: string; paymentAddress: string; minValueEth: string }> = {
  ethereum: {
    rpcUrl: process.env.ALCHEMY_ETH_RPC_URL || '',
    paymentAddress: (process.env.ETH_PAYMENT_ADDRESS || '').toLowerCase(),
    minValueEth: '0.01',
  },
  polygon: {
    rpcUrl: process.env.ALCHEMY_POLYGON_RPC_URL || '',
    paymentAddress: (process.env.POLYGON_PAYMENT_ADDRESS || '').toLowerCase(),
    minValueEth: '0.01',
  },
  polygonamoy: {
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/',
    paymentAddress: (process.env.POLYGON_AMOY_PAYMENT_ADDRESS || '').toLowerCase(),
    minValueEth: '0.01',
  },
  bnb: {
    rpcUrl: process.env.ALCHEMY_BNB_RPC_URL || '',
    paymentAddress: (process.env.BNB_PAYMENT_ADDRESS || '').toLowerCase(),
    minValueEth: '0.01',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, txHash, chain, userId } = req.body;
  if (!walletAddress || !txHash || !chain || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const chainKey = chain.toLowerCase();
  const config = CHAIN_CONFIG[chainKey];
  if (!config || !config.rpcUrl || !config.paymentAddress) {
    return res.status(400).json({ error: 'Unsupported or misconfigured chain' });
  }

  let tx;
  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    tx = await provider.getTransaction(txHash);
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found on chain' });
    }
    if (!tx.to || tx.to.toLowerCase() !== config.paymentAddress) {
      return res.status(400).json({ error: 'Transaction not sent to payment address' });
    }
    if (Number(ethers.formatEther(tx.value)) < Number(config.minValueEth)) {
      return res.status(400).json({ error: 'Insufficient payment amount' });
    }
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ error: 'Transaction not sent from your wallet' });
    }
    // Wait for at least 1 confirmation
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return res.status(400).json({ error: 'Transaction not confirmed yet' });
    }
    const confirmations = await receipt.confirmations();
    if (confirmations < 1) {
      return res.status(400).json({ error: 'Transaction not confirmed yet' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Blockchain verification failed', details: (err as Error).message });
  }

  // --- Award credits ---
  const CREDITS_TO_AWARD = 100;
  try {
    // Log payment
    await supabase.from('crypto_payments').insert([
      { user_id: userId, wallet_address: walletAddress, tx_hash: txHash, chain, status: 'completed', created_at: new Date().toISOString(), completed_at: new Date().toISOString() }
    ]);

    // Update or insert user credits
    const { data: userCredit } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    let updateError = null;
    if (userCredit) {
      const { error } = await supabase
        .from('user_credits')
        .update({ credits: userCredit.credits + CREDITS_TO_AWARD })
        .eq('user_id', userId);
      updateError = error;
    } else {
      const { error } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, credits: CREDITS_TO_AWARD }]);
      updateError = error;
    }
    if (updateError) {
      return res.status(500).json({ error: 'Failed to award credits', details: updateError.message });
    }
    return res.status(200).json({ success: true, creditsAwarded: CREDITS_TO_AWARD });
  } catch (err) {
    return res.status(500).json({ error: 'Database error', details: (err as Error).message });
  }
}
