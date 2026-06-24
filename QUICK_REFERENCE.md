# 🚀 Love Lens - Quick Reference

## ⚡ Get Started in 3 Steps

### **Step 1: Setup Database (2 minutes)**
```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste: love-lens/database/migration_create_core_tables.sql
3. Click Run ✅
```

### **Step 2: Get API Key for Chat (1 minute)**
```bash
1. Visit: https://openrouter.ai
2. Sign up → Keys → Create new key
3. Copy key (sk-or-v1-...)
```

### **Step 3: Test Everything (5 minutes)**
```bash
1. npm run dev
2. Visit: http://localhost:3000/survey
3. Complete survey → Get LOVE-XXXX-XXXX key
4. View report → See your archetype & scores
5. Open chat → Enter API key → Ask questions
```

---

## 📁 Key Files

### **Backend Services:**
```
src/lib/services/
├── db.service.ts           → All database operations
├── report.generator.ts     → Report creation & insights
└── chatbot.service.ts      → AI chat with full context
```

### **Database:**
```
database/
└── migration_create_core_tables.sql  → Run this in Supabase!
```

### **Frontend Pages:**
```
src/app/
├── survey/page.tsx   → Survey form (creates user & saves data)
├── report/page.tsx   → Relationship report (generates insights)
└── chat/page.tsx     → AI counselor (personalized guidance)
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Anonymous users with LOVE-XXXX keys |
| `survey_submissions` | All Q&A + scores + insights |
| `chat_conversations` | AI chat history |

---

## 🎯 User Flow

```
Survey → Submit → Get Key → View Report → AI Chat
   ↓         ↓        ↓          ↓           ↓
  Q&A    Save DB   LOVE-XX    Analyze    Personalized
                                          Guidance
```

---

## 🤖 What AI Chatbot Knows About Each User

- ✅ Every question they answered
- ✅ Every answer they chose
- ✅ All their scores (communication, trust, intimacy, etc.)
- ✅ Their relationship archetype
- ✅ Their flags (abuse warnings, trust issues, etc.)
- ✅ Percentile ranking vs other couples

**Result:** Highly personalized, context-aware advice!

---

## 📊 7 Relationship Archetypes

1. ⚡ **Power Couple** - Strong across all areas
2. 🏗️ **Steady Builders** - Stable & consistent  
3. 🔥 **Passionate Adventurers** - High intimacy
4. 💚 **Healing Hearts** - Working through issues
5. 🔨 **Work in Progress** - At a crossroads
6. 🆘 **Crisis Navigators** - Needs help now
7. ☮️ **Peaceful Partners** - Calm & harmonious

---

## 🔧 Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://amnusjgdswoxuvjhzrmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Test Queries

### Check if database is working:
```sql
-- See all users
SELECT user_key, category, survey_completed, created_at 
FROM users 
ORDER BY created_at DESC;

-- See recent submissions
SELECT user_key, normalized_score, relationship_archetype, created_at
FROM survey_submissions
ORDER BY created_at DESC;

-- See chat activity
SELECT user_key, total_messages, ai_model, created_at
FROM chat_conversations
ORDER BY created_at DESC;
```

---

## 🎨 Score Colors

| Score | Range | Color | Meaning |
|-------|-------|-------|---------|
| Excellent | 8.5-10 | Green | Thriving |
| Great | 7.0-8.4 | Blue | Healthy |
| Good | 5.5-6.9 | Yellow | Stable |
| Fair | 4.0-5.4 | Orange | Needs Work |
| Needs Attention | 1.0-3.9 | Red | Crisis |

---

## 🆘 Crisis Resources (Built-in)

When abuse/crisis detected:
- National Crisis Line: **988**
- Domestic Violence: **1-800-799-7233**
- Crisis Text: **741741**

---

## 📈 What Gets Calculated

### For Each User:
- Overall relationship score (1-10)
- 6 dimensional scores
- Breakup risk (Low/Moderate/High)
- Relationship archetype
- Percentile rank (better than X%)
- Stability index (0-100)
- Growth potential (0-100)
- Personalized strengths
- Concerns to address
- Actionable recommendations

### All Automated! 🎉

---

## 🔐 Privacy Features

- ✅ No names, emails, or phone numbers
- ✅ Anonymous LOVE-XXXX keys
- ✅ No login required
- ✅ User controls access with their key
- ✅ GDPR compliant
- ✅ No third-party tracking

---

## 💡 Pro Tips

1. **Save user keys** - They can't recover lost keys!
2. **Test with different categories** - Each has unique questions
3. **Check browser console** - Logs show database operations
4. **Monitor API usage** - OpenRouter tracks your token usage
5. **Review chat conversations** - Great for understanding user needs

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "User not found" | Run database migration |
| "Survey not found" | Complete survey first |
| "Chat not working" | Enter valid API key |
| "Database timeout" | Check Supabase project status |

---

## 📞 Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **OpenRouter Dashboard:** https://openrouter.ai/activity
- **Project Docs:** `BACKEND_SETUP_COMPLETE.md`
- **Database Schema:** `database/migration_create_core_tables.sql`

---

**Status:** ✅ **PRODUCTION READY!**

Your relationship assessment platform is complete and ready to help couples! 🎉💕


