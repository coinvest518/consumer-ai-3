# Tradeline System - Complete Flow & Storage Explanation

## 📋 System Overview

### What We Built
A tradeline marketplace where users can:
1. **Browse** tradelines without logging in (public access)
2. **Purchase** tradelines after logging in (saves to database)
3. **Sign** legal agreements electronically (FCRA compliant)
4. **Track** orders and inventory

---

## 🗂️ File Structure

### **Frontend Components**
```
src/pages/
  └── TradelinesPage.tsx              ← Main storefront (static data)

src/components/tradelines/
  ├── TradelineCheckout.tsx           ← 4-step checkout modal (saves to DB)
  ├── ProductDetailModal.tsx          ← Product details popup (no DB)
  └── AgreementSigning.tsx            ← Signature capture (no DB, just UI)

src/data/
  └── tradelineInventory.ts           ← Static inventory data (no DB needed)
```

### **Backend API**
```
api/
  └── user.ts                         ← All tradeline endpoints consolidated
      ├── GET  /api/user/tradelines/available  (NOT USED - we use static data)
      ├── POST /api/user/tradelines/sign-agreement  ✅ ACTIVE
      ├── POST /api/user/tradelines/create-order    ✅ ACTIVE
      ├── POST /api/user/tradelines/sync            ⚠️ ADMIN ONLY
      └── POST /api/user/tradelines/seed-data       ⚠️ ADMIN ONLY
```

### **Database**
```
supabase/migrations/
  └── 20260207_create_tradelines.sql  ← Schema for 4 tables
      ├── tradelines              (NOT USED YET - static data instead)
      ├── tradeline_orders        ✅ Used for purchases
      ├── signed_agreements       ✅ Used for signatures
      └── document_uploads        ⏳ Phase 2 (not active)
```

---

## 🔄 Complete User Flow

### **Phase 1: BROWSING (No Login Required)**
```
User visits /tradelines
   ↓
TradelinesPage.tsx loads
   ↓
Imports data from: src/data/tradelineInventory.ts
   ↓
Converts static data to component format
   ↓
Displays tradeline cards with:
   - Bank name
   - Credit limit
   - Account age
   - Price
   - Stock count
   - Guarantees
   ↓
NO API CALLS
NO DATABASE QUERIES
INSTANT LOADING
```

**Code Location:** `TradelinesPage.tsx` lines 37-75
```typescript
const tradelines = tradelineInventory.map(item => ({
  id: item.cardId,
  bank_name: item.bank,
  credit_limit: item.creditLimit,
  // ... converts static format to component format
}))
```

---

### **Phase 2: PRODUCT DETAILS (No Login Required)**
```
User clicks "View Details" button
   ↓
ProductDetailModal opens
   ↓
Shows detailed info:
   - Full guarantees
   - Timeline (purchase → reporting → posted)
   - Credit impact breakdown
   - FAQ links
   ↓
NO DATABASE
JUST PROPS PASSED FROM PARENT
```

**Code Location:** `ProductDetailModal.tsx`  
**Data Source:** Props from selected tradeline

---

### **Phase 3: LOGIN GATE**
```
User clicks "Get Started"
   ↓
TradelinesPage checks: if (!user)
   ↓
IF NOT LOGGED IN:
   → Show alert: "Please login or create account"
   → Auto-hide after 5 seconds
   → Button disabled
   ↓
IF LOGGED IN:
   → Proceed to checkout
```

**Code Location:** `TradelinesPage.tsx` lines 87-94
```typescript
const handleGetStarted = (product) => {
  if (!user) {
    setShowLoginAlert(true);
    return;
  }
  setShowCheckout(true);
}
```

---

### **Phase 4: CHECKOUT PROCESS (Login Required)**

#### **Step 1: Sign Agreement** 🖊️
```
TradelineCheckout modal opens
   ↓
Shows AgreementSigning component
   ↓
User sees:
   - Tab 1: Full legal agreement text (7 sections)
   - Tab 2: Sign & Confirm form
   ↓
User fills out:
   ✓ Full Name (required)
   ✓ Email (required)
   ✓ Phone (optional)
   ✓ Signature on canvas (required)
   ✓ Terms acceptance checkbox (required)
   ↓
Click "Sign Agreement"
   ↓
Frontend captures:
   - Form data
   - Canvas signature as base64 PNG
   - User IP address
   - Timestamp
   - User agent
   ↓
POST /api/user/tradelines/sign-agreement
   ↓
SAVES TO DATABASE: signed_agreements table
   {
     user_id,
     full_name,
     email,
     phone,
     signature_data,      ← base64 PNG image
     ip_address,          ← audit trail
     user_agent,          ← browser info
     is_valid: true
   }
   ↓
Returns: { agreementId }
   ↓
Move to Step 2
```

**Code Location:** 
- UI: `AgreementSigning.tsx`
- Handler: `TradelineCheckout.tsx` lines 76-107
- API: `api/user.ts` `/tradelines/sign-agreement`

**Database Table:** `signed_agreements`

---

#### **Step 2: Confirm Purchase** ✅
```
Shows order summary:
   - Product details
   - Quantity selector (default: 1)
   - Total price
   ↓
Click "Confirm Purchase"
   ↓
POST /api/user/tradelines/create-order
   {
     userId,
     tradelineId,
     quantity: 1,
     agreementId  ← links to signature from Step 1
   }
   ↓
Backend logic:
   1. Fetch tradeline from... WAIT, PROBLEM!
      → tradelines table doesn't have data yet
      → Using static data, so we skip stock check for now
   2. Create order record
   3. Link agreement to order
   ↓
SAVES TO DATABASE: tradeline_orders table
   {
     user_id,
     tradeline_id,
     quantity,
     price,
     status: 'pending',
     order_number  ← unique "TL-ABC123-DEF45"
   }
   ↓
Update agreement record:
   signed_agreements.order_id = new_order_id
   ↓
Returns: { orderId, orderNumber, total }
   ↓
Move to Step 3
```

**Code Location:**
- Handler: `TradelineCheckout.tsx` lines 110-146
- API: `api/user.ts` `/tradelines/create-order`

**Database Tables:** 
- `tradeline_orders` (new record)
- `signed_agreements` (update with order_id)

---

#### **Step 3: Service Agreement Info** ℹ️
```
Read-only information page
   ↓
Shows:
   "After your purchase, we'll contact you to collect
    required documents via secure portal..."
   ↓
Lists required documents:
   ✓ Driver's License (AU)
   ✓ Social Security Card (AU)
   ✓ Utility Bill (Billing Address)
   ↓
NO DATABASE OPERATIONS
JUST INFORMATIONAL
   ↓
Click "Continue" → Move to Step 4
```

**Code Location:** `TradelineCheckout.tsx` lines 358-404

---

#### **Step 4: Payment Information** 💳
```
Read-only information page
   ↓
Shows:
   "We accept ACH/E-Check payments only.
    After document verification, we'll send
    payment instructions via email..."
   ↓
NO PAYMENT PROCESSING YET
NO DATABASE OPERATIONS
   ↓
Click "Complete Order"
   ↓
Shows success page:
   ✓ Order number
   ✓ "Check your email for next steps"
   ↓
Modal closes
```

**Code Location:** `TradelineCheckout.tsx` lines 406-489

---

## 💾 Storage Breakdown

### **What's Stored in Database:**

#### 1. **signed_agreements** Table ✅ ACTIVE
```sql
Columns:
- id                 UUID PRIMARY KEY
- user_id            UUID → auth.users (who signed)
- order_id           UUID → tradeline_orders (links to purchase)
- full_name          VARCHAR
- email              VARCHAR
- phone              VARCHAR
- signature_data     TEXT (base64 PNG image)
- ip_address         INET (audit trail)
- user_agent         TEXT (browser info)
- is_valid           BOOLEAN (default: true)
- created_at         TIMESTAMP

Example record:
{
  user_id: "abc-123",
  full_name: "John Doe",
  email: "john@example.com",
  signature_data: "data:image/png;base64,iVBORw0KG...",
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  is_valid: true
}
```

#### 2. **tradeline_orders** Table ✅ ACTIVE
```sql
Columns:
- id                 UUID PRIMARY KEY
- user_id            UUID → auth.users (who purchased)
- tradeline_id       UUID → tradelines (which product)
- quantity           INT (how many, usually 1)
- price              DECIMAL (locked price at purchase)
- status             VARCHAR (pending, completed, cancelled)
- order_number       VARCHAR UNIQUE (TL-ABC123-DEF45)
- created_at         TIMESTAMP
- updated_at         TIMESTAMP

Example record:
{
  user_id: "abc-123",
  tradeline_id: "22688",  ← card_id from static data
  quantity: 1,
  price: 336.00,
  status: "pending",
  order_number: "TL-ABC123-DEF45"
}
```

#### 3. **tradelines** Table ⚠️ NOT USED YET
```
This table exists but is EMPTY.
We're using static data instead (src/data/tradelineInventory.ts).

In the future, admin can:
- POST /api/user/tradelines/seed-data  → Load sample data
- POST /api/user/tradelines/sync       → Sync from inventory file

For now: SKIP THIS TABLE, use static file.
```

#### 4. **document_uploads** Table ⏳ PHASE 2
```
Table exists but NOT USED in current flow.
Phase 2 will add document upload portal:
- User logs in after purchase
- Visits /documents page
- Uploads required docs
- Admin verifies

NOT IMPLEMENTED YET.
```

---

### **What's Stored in Files (NOT Database):**

#### 1. **Product Inventory** → `src/data/tradelineInventory.ts`
```typescript
export const tradelineInventory = [
  {
    cardId: "22688",
    bank: "CP1",
    creditLimit: 7000,
    accountAge: "4y4m",
    price: 336,
    stock: 1,
    // ... more fields
  },
  // ... more tradelines
];
```

**Why file instead of database?**
- ✅ No API calls needed for browsing
- ✅ Instant page load
- ✅ Easy to update (just edit file + deploy)
- ✅ Works before database is deployed
- ✅ Admin can update via Git

**How to update inventory:**
1. Edit `src/data/tradelineInventory.ts`
2. Git commit + push
3. Vercel auto-deploys
4. Users see new inventory immediately

---

## 🔧 What Needs to Be Deleted?

### **Files to Keep:**
✅ `src/pages/TradelinesPage.tsx` - Main page  
✅ `src/components/tradelines/TradelineCheckout.tsx` - Checkout  
✅ `src/components/tradelines/ProductDetailModal.tsx` - Details  
✅ `src/components/tradelines/AgreementSigning.tsx` - Signature  
✅ `src/data/tradelineInventory.ts` - Inventory data  
✅ `api/user.ts` - API endpoints  
✅ `supabase/migrations/20260207_create_tradelines.sql` - Schema  

### **Endpoints to Keep in api/user.ts:**
✅ `POST /api/user/tradelines/sign-agreement` - Used in checkout  
✅ `POST /api/user/tradelines/create-order` - Used in checkout  
⚠️ `POST /api/user/tradelines/sync` - ADMIN ONLY (optional)  
⚠️ `POST /api/user/tradelines/seed-data` - ADMIN ONLY (optional)  
❌ `GET /api/user/tradelines/available` - **NOT USED, CAN DELETE**

### **What Can Be Removed:**

#### 1. **Unused API endpoint** - GET /api/user/tradelines/available
```typescript
// DELETE THIS from api/user.ts (lines ~180-195):
if (url.includes('/user/tradelines/available') && req.method === 'GET') {
  const { data, error } = await supabase
    .from('tradelines')
    .select('*')
    // ...
}
```
**Reason:** We use static data, not API fetch

#### 2. **Unused import** - tradelineInventory from api/user.ts
Only needed if keeping sync endpoint. If you remove sync/seed, remove:
```typescript
// DELETE THIS from api/user.ts line 3:
import { tradelineInventory } from '../src/data/tradelineInventory';
```

---

## 📊 Current System State

### **What Works NOW (no database needed):**
✅ Browse tradelines  
✅ View details  
✅ Login gate  
✅ All UI components  

### **What Needs Database Deployed:**
❌ Sign agreement (needs `signed_agreements` table)  
❌ Create order (needs `tradeline_orders` table)  
❌ Track orders (needs both tables)  

### **What's Not Built Yet:**
⏳ Document upload portal  
⏳ Payment processing (Stripe ACH)  
⏳ Email notifications  
⏳ Admin panel  

---

## 🎯 Summary

### **Data Flow:**
```
DISPLAY (Static)     →  src/data/tradelineInventory.ts
   ↓
BROWSE (Frontend)    →  TradelinesPage.tsx (no API)
   ↓
PURCHASE (Login)     →  TradelineCheckout.tsx
   ↓
SIGN (Database)      →  POST /api/.../sign-agreement
   ↓                     SAVES: signed_agreements table
ORDER (Database)     →  POST /api/.../create-order
                         SAVES: tradeline_orders table
```

### **Storage:**
- **Browsing:** File (`tradelineInventory.ts`)
- **Signatures:** Database (`signed_agreements`)
- **Orders:** Database (`tradeline_orders`)
- **Documents:** Not implemented yet

### **Security:**
- Browsing: Public (no auth)
- Checkout: Login required (RLS policies)
- Database: Row Level Security (users see only their data)
- Signatures: Full audit trail (IP, timestamp, user agent)

---

## 🚀 Next Steps

1. **Deploy database schema:**
   ```sql
   -- Run in Supabase SQL Editor:
   supabase/migrations/20260207_create_tradelines.sql
   ```

2. **Test checkout flow:**
   - Login as user
   - Click "Get Started"
   - Sign agreement
   - Complete purchase
   - Check database for records

3. **Clean up unused code:**
   - Remove GET /api/user/tradelines/available endpoint
   - Remove tradelineInventory import from api/user.ts (if not using sync)
   - Keep everything else

4. **Phase 2 (later):**
   - Build document upload portal
   - Implement payment processing
   - Add email notifications
   - Create admin dashboard

---

**The system is production-ready for browsing. Checkout requires database deployment.**
