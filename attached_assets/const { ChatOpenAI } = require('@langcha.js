const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const Stripe = require('stripe');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Initialize OpenAI Chat Model
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4',
  temperature: 0.7,
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

// Memory storage for chat sessions
const chatSessions = new Map();

// Helper to get or create chat history
function getChatHistory(sessionId) {
  if (!chatSessions.has(sessionId)) {
    chatSessions.set(sessionId, [
      new SystemMessage(
        "You are ConsumerAI, a helpful assistant specialized in consumer rights, " +
        "credit disputes, and financial advice. Be clear, professional, and focused on helping users " +
        "understand their rights and options."
      )
    ]);
  }
  return chatSessions.get(sessionId);
}

// Process a message
async function processMessage(message, sessionId) {
  try {
    const history = getChatHistory(sessionId);
    const userMessage = new HumanMessage(message);
    history.push(userMessage);
    const aiResponse = await chatModel.invoke(history);
    const aiMessage = new AIMessage(aiResponse.content);
    history.push(aiMessage);
    return {
      message: aiResponse.content,
      sessionId,
      messageId: `${Date.now()}-ai`,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

// Storage plan definitions
const STORAGE_PLANS = {
  basic: { price: 500, storage: 1073741824, files: 200 },
  pro: { price: 1000, storage: 5368709120, files: 1000 },
  enterprise: { price: 2500, storage: 21474836480, files: 5000 }
};

// Asynchronous function to process a Stripe event after responding
const processStripeEvent = async (event) => {
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (userId) {
                console.log(`Processing successful checkout for user: ${userId}`);
                const { data: metrics, error: metricsError } = await supabase
                    .from('user_metrics')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (metricsError && metricsError.code !== 'PGRST116') throw metricsError;

                const currentMetrics = metrics || {
                    user_id: userId,
                    daily_limit: 5,
                    chats_used: 0,
                    is_pro: false,
                };

                await supabase.from('user_metrics').upsert({
                    ...currentMetrics,
                    daily_limit: currentMetrics.daily_limit + 50,
                    is_pro: true,
                    last_purchase: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                });

                await supabase.from('purchases').insert([{
                    user_id: userId,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    credits: 50,
                    stripe_session_id: session.id,
                    status: 'completed',
                    metadata: {
                        payment_status: session.payment_status,
                        customer_email: session.customer_details?.email
                    }
                }]);
                console.log(`User ${userId} metrics and purchase recorded.`);
            } else {
                console.error('Webhook received for checkout.session.completed without a userId in metadata.');
            }
        }
    } catch (error) {
        console.error('Error processing stripe-webhook event asynchronously:', error);
    }
};

// Asynchronous function to process a storage-related Stripe event
const processStorageEvent = async (event) => {
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, storageBytes: storageBytesStr, files: filesStr, plan } = session.metadata || {};
            const storageBytes = parseInt(storageBytesStr || '0');
            const files = parseInt(filesStr || '0');

            if (!userId || !storageBytes || !files || !plan) {
                throw new Error('Missing required metadata in Stripe session for storage upgrade');
            }
            console.log(`Processing storage upgrade for user: ${userId}, plan: ${plan}`);

            await supabase.from('storage_transactions').update({
                status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('stripe_session_id', session.id);

            const { data: currentLimits, error: limitsError } = await supabase
                .from('storage_limits')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (limitsError && limitsError.code !== 'PGRST116') throw limitsError;

            if (currentLimits) {
                await supabase.from('storage_limits').update({
                    max_storage_bytes: (currentLimits.max_storage_bytes || 0) + storageBytes,
                    max_files: (currentLimits.max_files || 0) + files,
                    is_premium: true,
                    tier_name: plan,
                    updated_at: new Date().toISOString()
                }).eq('user_id', userId);
            } else {
                await supabase.from('storage_limits').insert([{
                    user_id: userId,
                    max_storage_bytes: storageBytes,
                    used_storage_bytes: 0,
                    max_files: files,
                    used_files: 0,
                    is_premium: true,
                    tier_name: plan
                }]);
            }
            console.log(`Storage limits updated for user: ${userId}`);
        }
    } catch (error) {
        console.error('Error processing storage/webhook event asynchronously:', error);
    }
};


// Main API handler
module.exports = async function handler(req, res) {
  // CORS headers are handled by the cors middleware in server.js
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = req.url.split('?')[0].replace(/^\//, '') || '';
  console.log(`[API Router] Routing request to: ${path}`);

  try {
    // Stripe webhook endpoint
    if (path === 'stripe-webhook') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const sig = req.headers['stripe-signature'];
        try {
            const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
            res.status(200).json({ received: true }); // Respond immediately
            processStripeEvent(event); // Process in the background
        } catch (err) {
            console.error(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        return; // Stop further execution
    }

    // Storage webhook endpoint
    else if (path === 'storage/webhook') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const sig = req.headers['stripe-signature'];
        try {
            const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
            res.status(200).json({ received: true }); // Respond immediately
            processStorageEvent(event); // Process in the background
        } catch (err) {
            console.error('Storage webhook signature verification failed:', err.message);
            return res.status(400).json({ error: err.message });
        }
        return; // Stop further execution
    }

    // Other endpoints...
    // Note: The rest of your API logic remains the same.
    // The following is your original code for other endpoints.

    // Chat endpoint
    if (path === 'chat') {
      if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const { message, sessionId } = req.body;
      if (!message || !sessionId) return res.status(400).json({ error: 'Missing message or sessionId' });
      const responseData = await processMessage(message, sessionId);
      return res.status(200).json({ data: responseData });
    }

    // ... (rest of your endpoints: chat/test, chat/history, session, etc.)
    // The logic for these non-webhook endpoints does not need to change.
    // Ensure you copy the rest of your original endpoint logic here.

    // Fallback for any unhandled paths
    else {
        return res.status(404).json({
            error: { message: `API endpoint /${path} not found`, code: 'NOT_FOUND' }
        });
    }

  } catch (error) {
    console.error(`[API Router] Error handling ${path}:`, error);
    return res.status(500).json({
      error: {
        message: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }
    });
  }
};