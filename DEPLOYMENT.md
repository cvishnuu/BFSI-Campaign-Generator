# BFSI Campaign Generator - Deployment Guide

This document covers deploying the BFSI Campaign Generator to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- Backend deployed to Railway (see main DEPLOYMENT.md)
- API key generated from admin panel

## Step-by-Step Deployment

### 1. Prepare Environment Variables

Create or update `.env.production`:

```env
# Backend API URL (from Railway deployment)
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1

# API Key (generate from admin panel after backend deployment)
NEXT_PUBLIC_API_KEY=your_api_key_here

# Workflow ID
NEXT_PUBLIC_WORKFLOW_ID=workflow_bfsi_marketing_template
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Import this repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: Leave empty (or adjust for monorepo)
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
5. Add environment variables from `.env.production`
6. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 3. Configure Custom Domain (Optional)

1. In Vercel project settings → **"Domains"**
2. Add your domain: `campaigns.yourdomain.com`
3. Update DNS records as instructed
4. Update backend CORS_ORIGIN to include new domain

### 4. Update Backend CORS

After getting your Vercel URL, update the backend:

1. Go to Railway → Backend service → **"Variables"**
2. Add your Vercel URL to `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://admin.vercel.app,https://your-campaign.vercel.app
   ```
3. Backend will auto-redeploy

## Verification

### Test the Deployment

1. Visit your Vercel URL
2. Upload a test CSV file:
   ```csv
   customerId,name,phone,product
   CUST001,John Smith,+919876543210,Premium Credit Card
   CUST002,Sarah Johnson,+919876543211,Investment Portfolio
   ```
3. Fill in campaign details:
   - Prompt: "Generate marketing messages based on customer product"
   - Target Audience: "High-income professionals aged 30-45"
   - Tone: "Professional"
4. Click "Start Campaign"
5. Verify you're redirected to review page
6. Check AI-generated content displays correctly
7. Approve the campaign
8. Download results

### Test API Connection

```bash
# Test backend connection
curl https://your-backend.up.railway.app/health

# Test workflow execution (should return execution ID)
curl -X POST https://your-backend.up.railway.app/api/v1/public/agents/workflow_bfsi_marketing_template/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": {
      "csvData": [{"customerId":"TEST001","name":"Test User","phone":"+919876543210","product":"Test Product"}],
      "prompt": "Test message",
      "targetAudience": "Test audience",
      "tone": "professional"
    },
    "description": "Test campaign"
  }'
```

## Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
# Solution: Clear build cache and redeploy
vercel --prod --force
```

**Error: "Environment variable not defined"**
```bash
# Solution: Check all required env vars are set in Vercel
# Go to Settings → Environment Variables
```

### Runtime Errors

**CORS Error**
- Verify backend CORS_ORIGIN includes your Vercel URL
- Check for trailing slashes (should not have them)
- Redeploy backend after CORS update

**API Key Invalid**
- Verify key is copied correctly (no extra spaces)
- Check key is active in admin panel
- Ensure key has access to the workflow

**AI Content Not Displaying**
- Check browser console for errors
- Verify backend is returning data: `/public/executions/:id/pending-approval`
- Check frontend data transformation logic

### Performance Issues

**Slow Initial Load**
```bash
# Enable Next.js optimizations in next.config.js
{
  images: {
    domains: ['your-backend.up.railway.app'],
  },
  compress: true,
}
```

**Slow API Calls**
- Check Railway backend is not sleeping (free tier)
- Consider upgrading Railway for 24/7 uptime
- Add loading states to improve perceived performance

## Monitoring

### Vercel Analytics

1. Go to Vercel project → **"Analytics"**
2. Monitor:
   - Page views
   - Web Vitals (performance)
   - Errors
   - API latency

### Error Tracking

Add Sentry for error tracking:

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure in next.config.js
# See: https://docs.sentry.io/platforms/javascript/guides/nextjs/
```

## Maintenance

### Update Deployment

```bash
# After code changes, push to GitHub
git push origin main

# Vercel auto-deploys from main branch
# Or manually redeploy in Vercel dashboard
```

### Rollback Deployment

1. Vercel dashboard → **"Deployments"**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Update Environment Variables

1. Vercel dashboard → **"Settings"** → **"Environment Variables"**
2. Update values
3. Redeploy to apply changes

## Security Best Practices

- ✅ Never commit `.env` files with real API keys
- ✅ Use environment variables for all secrets
- ✅ Regularly rotate API keys
- ✅ Monitor API usage in admin panel
- ✅ Set reasonable rate limits
- ✅ Enable HTTPS only (automatic on Vercel)

## Cost

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Analytics included

**Expected Usage:**
- ~5-10 GB bandwidth/month for typical use
- **Cost: $0/month**

## Support

**Deployment Issues:**
- Vercel Status: https://www.vercel-status.com
- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://discord.gg/vercel

**Application Issues:**
- Check backend logs in Railway
- Review frontend logs in Vercel
- Test API endpoints directly

---

✅ **Your BFSI Campaign Generator is now live!**

Share the URL with your users and start generating AI-powered marketing campaigns! 🚀
