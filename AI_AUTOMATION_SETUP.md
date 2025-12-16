# 🤖 AI Automation Setup Guide

## AI Models Used

Your backend will use these AI models (NOT OpenAI):

### **Primary AI Models:**
1. **Google Gemini** (gemini-pro)
   - Fast and cost-effective
   - Good for dispute letters and follow-ups
   - API: `@google/generative-ai`

2. **Mistral AI** (mistral-medium)
   - Excellent for legal content
   - Great for complex dispute scenarios
   - API: `@mistralai/mistralai`

3. **Anthropic Claude** (claude-3-haiku) - Backup
   - High quality legal writing
   - Use for premium features
   - API: `@anthropic-ai/sdk`

---

## 💰 Credit Pricing Structure

### **Free Features:**
- ✅ Basic email reminders (automated)
- ✅ Calendar deadline notifications
- ✅ Mail delivery notifications
- ✅ Weekly summary emails

### **Paid Features (Credits):**

| Feature | Credits | AI Model | What It Does |
|---------|---------|----------|--------------|
| **Set Reminder** | FREE | None | Simple email reminder for dispute |
| **AI Follow-Up Letter** | 3 | Gemini/Mistral | AI generates personalized follow-up letter |
| **AI Complaint Letter** | 3 | Gemini/Mistral | AI generates CFPB/FTC complaint |
| **AI Validation Letter** | 2 | Gemini | AI generates debt validation request |
| **AI Cease & Desist** | 2 | Gemini | AI generates cease & desist letter |
| **Premium AI Analysis** | 5 | Claude | Deep analysis of credit report |

---

## 🎯 How It Works in Dashboard

### **Disputes Tab - Two Buttons:**

**1. "Set Reminder (Free)" Button:**
- 🔔 Bell icon
- No credits charged
- Creates calendar event
- Sends basic email reminder
- User gets: "Don't forget to follow up on [Dispute Title]"

**2. "AI Follow-Up (3 credits)" Button:**
- ✨ Sparkles icon (gradient purple-blue)
- Costs 3 credits
- Checks user credit balance first
- If sufficient credits:
  - Backend calls Google Gemini or Mistral
  - AI generates personalized follow-up letter
  - Includes dispute details, bureau info, legal citations
  - Emails PDF + text version to user
  - Deducts 3 credits
- If insufficient credits:
  - Shows error: "You need 3 credits for AI-generated follow-up"
  - Prompts to purchase more credits

---

## 🔧 Backend Implementation

### **API Endpoint Structure:**

```javascript
// Backend: /api/generate-followup

POST /api/generate-followup
Headers: {
  Authorization: Bearer <user_token>
}
Body: {
  dispute_id: "uuid",
  ai_model: "gemini" // or "mistral"
}

Response: {
  success: true,
  letter_text: "...",
  pdf_url: "https://...",
  credits_charged: 3,
  credits_remaining: 47,
  ai_model_used: "gemini-pro"
}
```

### **AI Prompt Template:**

```javascript
const prompt = `
You are a consumer rights legal assistant. Generate a professional follow-up letter for a credit dispute.

Dispute Details:
- Bureau: ${dispute.bureau}
- Original Dispute: ${dispute.title}
- Date Sent: ${dispute.date_sent}
- Tracking Number: ${dispute.tracking_number}

Requirements:
1. Reference FCRA Section 611(a)(1)(A) - 30-day investigation requirement
2. Mention certified mail delivery date
3. Request immediate action
4. Professional but firm tone
5. Include user's rights under FCRA
6. Format as formal business letter

Generate the letter:
`;
```

### **Google Gemini Integration:**

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateFollowUp(dispute) {
  const prompt = buildPrompt(dispute);
  const result = await model.generateContent(prompt);
  const letter = result.response.text();
  return letter;
}
```

### **Mistral AI Integration:**

```javascript
import MistralClient from '@mistralai/mistralai';

const client = new MistralClient(process.env.MISTRAL_API_KEY);

async function generateFollowUp(dispute) {
  const prompt = buildPrompt(dispute);
  const response = await client.chat({
    model: 'mistral-medium',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
}
```

---

## 📧 Email Templates

### **Basic Reminder Email (Free):**

```
Subject: Reminder: Follow up on your Equifax dispute

Hi [User Name],

This is a friendly reminder about your dispute:

📄 Dispute: Unauthorized account on Equifax
📅 Sent: January 1, 2025
⏰ 30-day deadline: January 31, 2025

Action needed:
- Check if you've received a response
- If no response, consider filing a CFPB complaint
- Use our AI to generate a follow-up letter (3 credits)

[View Dispute] [Generate Follow-Up]

Best regards,
ConsumerAI Team
```

### **AI-Generated Follow-Up Email (3 credits):**

```
Subject: Your AI-Generated Follow-Up Letter is Ready

Hi [User Name],

Your personalized follow-up letter has been generated! ✨

We used AI to create a professional, legally-sound follow-up letter for your Equifax dispute.

📎 Attachments:
- FollowUp_Equifax_2025-01-15.pdf
- FollowUp_Equifax_2025-01-15.docx

What's included:
✅ FCRA legal citations
✅ Reference to your original dispute
✅ Certified mail tracking number
✅ Demand for immediate action
✅ Your consumer rights

Next steps:
1. Review the letter
2. Print and sign
3. Mail via USPS certified mail
4. Add tracking number to dashboard

Credits used: 3
Credits remaining: 47

[View Dashboard] [Purchase More Credits]

Best regards,
ConsumerAI Team
```

---

## 🔐 Security & Credits

### **Credit Deduction Flow:**

1. User clicks "AI Follow-Up (3 credits)"
2. Frontend checks: `metrics.credits >= 3`
3. If yes: Send request to backend
4. Backend verifies credits in database
5. Backend calls AI model
6. Backend deducts 3 credits from `user_credits` table
7. Backend logs transaction in `email_logs` table
8. Backend sends email with generated letter
9. Frontend updates credit display

### **Database Transaction:**

```sql
-- Deduct credits atomically
UPDATE user_credits 
SET 
  credits = credits - 3,
  updated_at = NOW()
WHERE 
  user_id = $1 
  AND credits >= 3
RETURNING credits;

-- Log the transaction
INSERT INTO email_logs (
  user_id, 
  email_type, 
  credits_charged, 
  related_id, 
  related_type
) VALUES (
  $1, 
  'ai_followup', 
  3, 
  $2, 
  'dispute'
);
```

---

## 📊 Analytics & Tracking

Track these metrics per user:
- Total AI letters generated
- Credits spent on automation
- Success rate (disputes resolved)
- Most used AI features
- Average time to resolution

---

## 🚀 Deployment Checklist

### **Environment Variables Needed:**

```env
# AI Models
GOOGLE_AI_API_KEY=your_gemini_key
MISTRAL_API_KEY=your_mistral_key
ANTHROPIC_API_KEY=your_claude_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@consumerai.com

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Credits
DEFAULT_CREDITS=5
AI_FOLLOWUP_COST=3
AI_COMPLAINT_COST=3
AI_VALIDATION_COST=2
```

### **Backend Routes:**

```
POST /api/generate-followup      - Generate AI follow-up letter (3 credits)
POST /api/generate-complaint     - Generate AI complaint letter (3 credits)
POST /api/generate-validation    - Generate AI validation letter (2 credits)
POST /api/set-reminder           - Set basic reminder (free)
GET  /api/check-credits          - Check user credit balance
POST /api/purchase-credits       - Handle credit purchase
```

---

## 💡 Future Enhancements

1. **Smart AI Selection** - Auto-choose best AI model based on dispute type
2. **Multi-language Support** - Generate letters in Spanish, etc.
3. **Voice Input** - User speaks dispute details, AI generates letter
4. **Auto-Mail Service** - Backend mails letter via Lob API (10 credits)
5. **Success Prediction** - AI predicts likelihood of dispute success
6. **Template Learning** - AI learns from successful disputes

---

## 📝 Summary

✅ **Two button options in Disputes tab**  
✅ **Free basic reminders**  
✅ **AI-generated follow-ups for 3 credits**  
✅ **Uses Google Gemini & Mistral (not OpenAI)**  
✅ **All tracked per user in Supabase**  
✅ **Credit system integrated**  
✅ **Email automation ready**  

**Users can now automate their dispute follow-ups with AI!**
