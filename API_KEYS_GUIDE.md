# 🔑 API Keys Setup Guide - LinkedAI

Complete guide to get all required API keys for your LinkedIn Content Scheduler SaaS.

---

## 📊 API Keys Overview

| Service | Status | Free Tier | Required? | Purpose |
|---------|--------|-----------|-----------|---------|
| **Supabase** | ✅ Set up | Yes - Forever | ✅ Required | Database & Auth |
| **Google Gemini** | ✅ Free | 1,500 requests/day | ✅ Required | AI Post Generation |
| **LinkedIn** | ✅ Free | Yes | ✅ Required | Post to LinkedIn |
| **Razorpay** | ✅ Free | Yes (Test mode) | ✅ Required | Payments |
| **Resend** | ✅ Free | 3,000 emails/month | ✅ Required | Transactional Emails |
| **UploadThing** | ✅ Free | 2GB storage | ⚠️ Optional | Image Uploads |
| **PostHog** | ✅ Free | 1M events/month | ⚠️ Optional | Analytics |

---

## 1️⃣ Google Gemini API (REQUIRED - Post Generation)

### Status: ✅ **FREE SERVICE** (with generous quota!)

### Pricing:
- **Gemini 1.5 Flash**: **FREE** (up to 15 requests/minute, 1,500 requests/day)
- **No credit card required** for free tier
- Perfect for development and small-scale production

### How to Get:

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select a Google Cloud project (or create new one)
5. Copy the API key
6. Paste in `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```

### 💡 Free Tier Limits:
- **15 requests per minute**
- **1,500 requests per day**
- Perfect for testing and small-scale usage
- No credit card required!

### 💰 Cost Estimation:
- Generating LinkedIn posts: **100% FREE** (within quota)
- 1,500 posts per day = **FREE**
- Extremely affordable for a SaaS!

---

## 2️⃣ LinkedIn API (FREE - Required)

### Status: ✅ **100% FREE**

### How to Get:

1. Go to: https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Fill in details:
   - **App name**: LinkedAI Scheduler
   - **LinkedIn Page**: Select your page (or create one)
   - **Privacy policy URL**: `http://localhost:3000/privacy`
   - **App logo**: Upload any logo

4. After creating, go to **"Auth"** tab
5. Add **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   https://yourdomain.com/api/auth/linkedin/callback
   ```

6. Under **"Products"**, request access to:
   - ✅ **Sign In with LinkedIn**
   - ✅ **Share on LinkedIn** (may require verification)

7. Go to **"Auth"** tab and copy:
   - **Client ID**
   - **Client Secret**

8. Paste in `.env.local`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   ```

### ⚠️ Important Notes:
- LinkedIn may take **1-2 weeks** to approve "Share on LinkedIn" access
- You can start building, but posting will only work after approval
- Use **Test Mode** during development

---

## 3️⃣ Razorpay (FREE - Payments)

### Status: ✅ **FREE (Test Mode)**

### How to Get:

1. Go to: https://dashboard.razorpay.com/signup
2. Sign up (Indian phone number required)
3. Complete KYC (optional for test mode)
4. Go to: https://dashboard.razorpay.com/app/keys
5. Copy **Test Keys**:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

6. Paste in `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   ```

7. For webhooks:
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Copy **Webhook Secret**
   - Paste in `.env.local`:
     ```
     RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
     ```

### 💰 Pricing:
- **Test Mode**: 100% FREE
- **Live Mode**: 2% transaction fee (standard in India)

---

## 4️⃣ Resend (FREE - Emails)

### Status: ✅ **FREE - 3,000 emails/month**

### How to Get:

1. Go to: https://resend.com/signup
2. Sign up with GitHub or Email
3. Verify your email
4. Go to: https://resend.com/api-keys
5. Click **"Create API Key"**
6. Copy the key (starts with `re_...`)

7. Paste in `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### 📧 Setup Domain (Optional but Recommended):
1. Go to **Domains** → **Add Domain**
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records (TXT, CNAME) to your domain provider
4. Verify domain
5. Update email:
   ```
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### 💡 Free Tier:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Perfect for starting out!

---

## 5️⃣ UploadThing (OPTIONAL - Image Uploads)

### Status: ✅ **FREE - 2GB storage**

### How to Get:

1. Go to: https://uploadthing.com/dashboard
2. Sign up with GitHub
3. Create a new app
4. Copy:
   - **App ID**
   - **Secret**

5. Paste in `.env.local`:
   ```
   UPLOADTHING_SECRET=your_uploadthing_secret_here
   UPLOADTHING_APP_ID=your_uploadthing_app_id_here
   ```

### 💡 Free Tier:
- ✅ 2GB storage
- ✅ 100GB bandwidth/month
- ✅ Great for user avatars & post images

---

## 6️⃣ PostHog (OPTIONAL - Analytics)

### Status: ✅ **FREE - 1M events/month**

### How to Get:

1. Go to: https://app.posthog.com/signup
2. Sign up
3. Create a project
4. Go to **Project Settings**
5. Copy **Project API Key**

6. Paste in `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### 💡 Features:
- ✅ User analytics
- ✅ Event tracking
- ✅ Session recording
- ✅ Feature flags

---

## 7️⃣ Security Keys (REQUIRED)

### Generate Random Secrets:

Run these commands in terminal:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32
```

Paste results in `.env.local`:
```
NEXTAUTH_SECRET=generated_secret_here
JWT_SECRET=generated_secret_here
```

---

## 📝 Final Checklist

Before starting development, ensure you have:

### ✅ Required (Must Have):
- [ ] ✅ Supabase (Already set up)
- [ ] ⚠️ OpenAI API Key
- [ ] LinkedIn Client ID & Secret
- [ ] Razorpay Keys (Test mode)
- [ ] Resend API Key
- [ ] NEXTAUTH_SECRET
- [ ] JWT_SECRET

### ⚠️ Optional (Nice to Have):
- [ ] UploadThing (for image uploads)
- [ ] PostHog (for analytics)
- [ ] Domain for emails (Resend)

---

## 💰 Total Cost Breakdown

### Development (FREE):
- Supabase: **FREE**
- LinkedIn: **FREE**
- Razorpay (Test): **FREE**
- Resend: **FREE** (3K emails/month)
- UploadThing: **FREE** (2GB storage)
- PostHog: **FREE** (1M events/month)

### Only Paid Service:
- **OpenAI**: ~$5-10/month (depends on usage)

### 💡 Estimated Monthly Cost:
- **Development**: ~$5-10/month (OpenAI only)
- **Production (100 users)**: ~$20-30/month
- **Production (1000 users)**: ~$100-150/month

Very affordable for a SaaS! 🎉

---

## 🚀 Next Steps

1. **Get all required API keys** (follow guides above)
2. **Update `.env.local`** with your keys
3. **Restart dev server**: `npm run dev`
4. **Test each integration**:
   - ✅ Sign up/Login (Supabase)
   - ✅ Generate Post (OpenAI)
   - ✅ Connect LinkedIn
   - ✅ Test Payment (Razorpay)
   - ✅ Send Email (Resend)

---

## 🆘 Need Help?

### Common Issues:

**1. OpenAI "Insufficient Quota" Error:**
- Add payment method to OpenAI account
- Check billing limits

**2. LinkedIn "Share on LinkedIn" not approved:**
- Wait for LinkedIn approval (1-2 weeks)
- Use test mode for development

**3. Razorpay Webhook not working:**
- Make sure webhook URL is accessible (use ngrok for local testing)
- Verify webhook secret matches

**4. Resend emails not sending:**
- Verify email domain
- Check spam folder
- Ensure from email is verified

---

## 📚 Useful Links

- [OpenAI Pricing](https://openai.com/pricing)
- [LinkedIn Developer Docs](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Resend Documentation](https://resend.com/docs)
- [UploadThing Docs](https://docs.uploadthing.com/)
- [PostHog Docs](https://posthog.com/docs)

---

**Good luck building LinkedAI! 🚀**
