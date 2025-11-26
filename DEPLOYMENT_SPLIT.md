# BFSI Campaign Generator - Split Deployment Guide
## Frontend (Vercel) + BFF Backend (Railway)

This guide covers deploying the BFSI app with:
- **Frontend (Next.js)** → Vercel
- **BFF Backend (Express)** → Railway
- **Workflow Backend** → Already on Railway

---

## Phase 1: Deploy BFF Backend to Railway

### Step 1: Create Railway Project for BFF

1. Go to [Railway](https://railway.app) dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `bfsi-campaign-generator` repository
5. Click **"Add Service"** → **"GitHub Repo"**

### Step 2: Configure BFF Service

In Railway service settings:

**Service Name:** `bfsi-bff`

**Root Directory:**
```
apps/bff
```

**Build Command:** (Railway auto-detects from package.json)
```bash
pnpm build
```

**Start Command:** (Railway auto-detects from package.json)
```bash
pnpm start
```

**Watch Paths:** (Optional - trigger rebuild only when BFF changes)
```
apps/bff/**
```

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will auto-create a `DATABASE_URL` variable
3. The BFF will automatically use this connection string

### Step 4: Set Environment Variables

In Railway BFF service → **Variables** tab:

```bash
# Node Environment
NODE_ENV=production

# Port (Railway auto-assigns, but you can override)
PORT=4000

# Database (auto-set by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_your_production_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_publishable_key

# CORS Origins (will add Vercel URL after frontend deployment)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Step 5: Deploy BFF

1. Click **"Deploy"** in Railway
2. Wait for build to complete (~2-3 minutes)
3. Railway will give you a URL like: `https://bfsi-bff-production.up.railway.app`
4. **Save this URL** - you'll need it for Vercel frontend

### Step 6: Test BFF Backend

```bash
# Health check
curl https://bfsi-bff-production.up.railway.app/api/v1/health

# Should return: {"status": "ok"}
```

---

## Phase 2: Deploy Frontend to Vercel

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com) dashboard
2. Click **"Add New"** → **"Project"**
3. Import `bfsi-campaign-generator` from GitHub
4. Click **"Import"**

### Step 2: Configure Build Settings

**Framework Preset:** `Next.js`

**Root Directory:** `./` (leave as root, not apps/bff)

**Build Command:** (Vercel auto-detects)
```bash
pnpm build
```

**Output Directory:** (auto-detected)
```
.next
```

**Install Command:**
```bash
pnpm install
```

### Step 3: Set Environment Variables

In Vercel project → **Settings** → **Environment Variables**:

#### BFF Backend URL
```bash
NEXT_PUBLIC_BFF_URL=https://bfsi-bff-production.up.railway.app
```

#### Workflow Automation Backend (Public API)
```bash
NEXT_PUBLIC_API_URL=https://workflow-backend-production.up.railway.app/api/v1
NEXT_PUBLIC_API_KEY=9ebbb5f24a5b78de30483d030967939682b39ac59d674cf90e6b210eed69c8d4
NEXT_PUBLIC_WORKFLOW_ID=workflow_bfsi_marketing_template
```

#### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_production_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### EmailJS (Contact Form)
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_c0tjfha
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_61hft9i
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=ljHzTSLJWrKS542F0
```

#### Google Text-to-Speech (Demo Audio)
```bash
GOOGLE_TTS_API_KEY=AQ.Ab8RN6Kkj8lMlrekeUM7au62eux9WWgyU8iYfAc1W6SyzoI5xA
```

### Step 4: Deploy Frontend

1. Click **"Deploy"** in Vercel
2. Wait for build (~2-3 minutes)
3. Vercel will give you a URL like: `https://bfsi-campaign.vercel.app`

### Step 5: Update CORS in BFF Backend

Now that you have the Vercel URL, update Railway BFF environment:

1. Go to Railway → BFF service → **Variables**
2. Update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://bfsi-campaign.vercel.app,https://www.bfsi-campaign.com
```
3. BFF will auto-restart with new CORS settings

---

## Phase 3: Database Setup (BFF PostgreSQL)

### Run Database Migrations

The BFF backend uses PostgreSQL to store user data. You need to set up the schema:

```bash
# Option 1: SSH into Railway container (recommended)
# Railway → BFF service → Settings → "Connect via SSH"
railway connect bfsi-bff

# Inside container:
cd apps/bff
npx prisma migrate deploy

# Option 2: Connect locally via DATABASE_URL
# Copy DATABASE_URL from Railway variables
export DATABASE_URL="postgresql://..."
cd apps/bff
npx prisma migrate deploy
```

---

## Phase 4: Testing Deployment

### Test BFF Backend
```bash
curl https://bfsi-bff-production.up.railway.app/api/v1/health
# Expected: {"status": "ok", "database": "connected"}
```

### Test Frontend
1. Visit `https://bfsi-campaign.vercel.app`
2. Try signing up with Clerk
3. Upload CSV and test campaign generation
4. Check that demo tour audio works

### Test Integration
1. Create a campaign in frontend
2. Check that BFF receives request
3. Verify workflow backend is called
4. Check campaign results display correctly

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel (Frontend - Next.js)                     │
│  • Static pages (landing, pricing, demo)                    │
│  • Dynamic routes (dashboard, review)                       │
│  • Edge functions                                           │
│  • Image optimization                                       │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │ API calls                  │ API calls
             ▼                            ▼
┌─────────────────────────┐  ┌────────────────────────────────┐
│  Railway (BFF Backend)  │  │  Railway (Workflow Backend)    │
│  • Express + Clerk      │  │  • NestJS                      │
│  • User management      │  │  • Workflow engine             │
│  • PostgreSQL DB        │  │  • Compliance RAG (Gemini)     │
│  Port: 4000             │  │  • Public API                  │
└─────────────────────────┘  └────────────────────────────────┘
             │                            │
             │                            │
             ▼                            ▼
┌─────────────────────────┐  ┌────────────────────────────────┐
│   PostgreSQL (BFF)      │  │   PostgreSQL (Workflow)        │
│   • User data           │  │   • Workflows                  │
│   • Sessions            │  │   • Executions                 │
└─────────────────────────┘  │   • Compliance rules           │
                              └────────────────────────────────┘
```

---

## Cost Breakdown

| Service | Plan | Cost/Month |
|---------|------|------------|
| **Vercel Frontend** | Hobby (Free) | $0 |
| **Railway BFF Backend** | Starter | ~$5 |
| **Railway BFF PostgreSQL** | Starter | ~$5 |
| **Railway Workflow Backend** | Already deployed | $0 (existing) |
| **Railway Workflow PostgreSQL** | Already deployed | $0 (existing) |
| **Total New Cost** | | **~$10/month** |

---

## Custom Domain Setup (Optional)

### For Vercel (Frontend)
1. Vercel → Project → **Settings** → **Domains**
2. Add custom domain: `www.bfsi-campaign.com`
3. Update DNS:
   - CNAME `www` → `cname.vercel-dns.com`
   - A `@` → `76.76.21.21`

### For Railway (BFF Backend)
1. Railway → BFF service → **Settings** → **Domains**
2. Add custom domain: `api.bfsi-campaign.com`
3. Update DNS:
   - CNAME `api` → `bfsi-bff.up.railway.app`

4. Update Vercel env:
```bash
NEXT_PUBLIC_BFF_URL=https://api.bfsi-campaign.com
```

---

## Troubleshooting

### BFF Backend won't start
- Check Railway logs: `railway logs`
- Verify `DATABASE_URL` is set
- Check `CLERK_SECRET_KEY` is valid production key

### Frontend can't connect to BFF
- Check `NEXT_PUBLIC_BFF_URL` in Vercel
- Verify CORS `ALLOWED_ORIGINS` includes Vercel URL
- Test BFF directly: `curl https://bfsi-bff.railway.app/api/v1/health`

### Database connection errors
- Check PostgreSQL is running in Railway
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Run migrations: `npx prisma migrate deploy`

### Clerk authentication fails
- Ensure using **production** Clerk keys (not test keys)
- Check Clerk dashboard → **Deployments** → Add Vercel URL
- Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`

---

## Rollback Plan

### Revert Frontend (Vercel)
1. Vercel → **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Revert BFF Backend (Railway)
1. Railway → BFF service → **Deployments**
2. Click on previous deployment
3. Click **"Redeploy"**

---

## Next Steps After Deployment

1. ✅ Test all user flows (signup, login, campaign creation)
2. ✅ Verify demo tour works with audio
3. ✅ Check compliance verification is working
4. ✅ Test email notifications (EmailJS)
5. ✅ Monitor Railway logs for errors
6. ✅ Set up error tracking (Sentry - optional)
7. ✅ Configure production Clerk settings
8. ✅ Add custom domain (optional)

---

## Monitoring & Logs

### View Logs

**Vercel Frontend:**
```bash
# In Vercel dashboard → Project → Logs
# Or use CLI:
vercel logs
```

**Railway BFF Backend:**
```bash
# Railway CLI:
railway logs --service bfsi-bff

# Or in Railway dashboard → BFF service → Deployments → View Logs
```

### Set Up Alerts

**Railway:**
- Project → **Settings** → **Notifications**
- Add email/Slack alerts for deployment failures

**Vercel:**
- Project → **Settings** → **Notifications**
- Enable deployment and error notifications

---

## Environment Variables Checklist

### ✅ Railway BFF Backend
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `DATABASE_URL` (auto-set by PostgreSQL)
- [ ] `CLERK_SECRET_KEY` (production key)
- [ ] `CLERK_PUBLISHABLE_KEY` (production key)
- [ ] `ALLOWED_ORIGINS` (include Vercel URL)

### ✅ Vercel Frontend
- [ ] `NEXT_PUBLIC_BFF_URL` (Railway BFF URL)
- [ ] `NEXT_PUBLIC_API_URL` (Workflow backend URL)
- [ ] `NEXT_PUBLIC_API_KEY` (Workflow API key)
- [ ] `NEXT_PUBLIC_WORKFLOW_ID`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production)
- [ ] `CLERK_SECRET_KEY` (production)
- [ ] Clerk redirect URLs (4 variables)
- [ ] EmailJS variables (3 variables)
- [ ] `GOOGLE_TTS_API_KEY` (for demo audio)

---

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: `vercel logs`
3. Test BFF health: `curl https://your-bff.railway.app/api/v1/health`
4. Verify environment variables match this guide

---

**Deployment Date:** [Add date]
**Frontend URL:** https://bfsi-campaign.vercel.app
**BFF Backend URL:** https://bfsi-bff.up.railway.app
**Workflow Backend URL:** https://workflow-backend.up.railway.app
