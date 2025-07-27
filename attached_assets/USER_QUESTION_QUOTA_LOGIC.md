# User Question Quota Logic (Consumer AI Chat)

## Overview
This document explains how user question usage, limits, and stats are tracked and displayed in the Consumer AI Chat app, based on the current Supabase schema and frontend/backend logic as of July 2025.

---

## Database Structure

### `profiles` Table
- **questions_asked** (integer): How many questions the user has asked.
- **questions_remaining** (integer): How many questions the user has left (e.g., for free users, this might start at 5 or 10).
- **is_pro** (boolean): Whether the user is a paid/pro user (likely with unlimited or higher limits).

### `user_metrics` Table
- Tracks general user metrics (not directly used for question quota).

### `chat_history` Table
- Logs each chat message and response (not used for quota enforcement).

---

## Usage Logic
- When a user asks a question:
  - `questions_asked` is incremented.
  - `questions_remaining` is decremented.
- For free users, `questions_remaining` enforces the monthly or lifetime quota.
- For pro users (`is_pro: true`), quotas may be higher or unlimited.

---

## Frontend Display
- The frontend can fetch `questions_asked` and `questions_remaining` from the `profiles` table for the logged-in user.
- Example UI: "Questions remaining: 3/5" or "You have 2 free questions left."
- The pricing page currently advertises "credits/month" as a feature, but the actual quota logic is based on questions, not credits.

---

## Summary Table
| Table     | Field                | Purpose                        |
|-----------|----------------------|--------------------------------|
| profiles  | questions_asked      | How many questions user asked  |
| profiles  | questions_remaining  | How many questions left        |
| profiles  | is_pro               | Paid/unpaid status             |
| chat_history | message/response  | Chat logs (not quota)          |
| user_metrics | user_id, created_at | (General metrics, not quota)  |

---

## Implementation Notes
- All quota logic is handled by the backend and stored in the `profiles` table.
- The frontend should fetch and display these fields as needed.
- There is no active "credit" system in the schema; all logic is based on questions.

---

_Last updated: July 27, 2025_
