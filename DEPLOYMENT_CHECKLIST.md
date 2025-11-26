# BFSI Deployment Checklist
Quick reference for deploying to Vercel (Frontend) + Railway (BFF Backend)

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] Demo tour build fix applied (Shepherd.js types)
- [ ] 9 audio files committed in `public/demo/audio/`
- [ ] `.env.local` has all required variables
- [ ] BFF backend builds successfully: `cd apps/bff && pnpm build`
- [ ] Frontend builds successfully: `pnpm build`

## Part 1: Deploy BFF Backend (Railway)

### Create Railway Project
- [ ] Go to https://railway.app
- [ ] New Project → Deploy from GitHub → `bfsi-campaign-generator`
- [ ] Service name: `bfsi-bff`
- [ ] Root directory: `apps/bff`

### Add PostgreSQL
- [ ] New → Database → PostgreSQL
- [ ] Note: `DATABASE_URL` is auto-created

### Set Environment Variables
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
ALLOWED_ORIGINS=http://localhost:3000
```

### Deploy
- [ ] Click Deploy
- [ ] Wait for build (~2-3 min)
- [ ] Copy Railway URL: `https://bfsi-bff-production.up.railway.app`
- [ ] Test: `curl https://your-bff-url.railway.app/api/v1/health`

### Run Database Migrations
```bash
# Connect to Railway
railway connect bfsi-bff

# Run migrations
cd apps/bff
npx prisma migrate deploy
```

## Part 2: Deploy Frontend (Vercel)

### Create Vercel Project
- [ ] Go to https://vercel.com
- [ ] New Project → Import `bfsi-campaign-generator`
- [ ] Framework: Next.js
- [ ] Root directory: `./`

### Set Environment Variables
**BFF Backend:**
```bash
NEXT_PUBLIC_BFF_URL=https://bfsi-bff-production.up.railway.app
```

**Workflow Backend:**
```bash
NEXT_PUBLIC_API_URL=https://workflow-backend.railway.app/api/v1
NEXT_PUBLIC_API_KEY=9ebbb5f24a5b78de30483d030967939682b39ac59d674cf90e6b210eed69c8d4
NEXT_PUBLIC_WORKFLOW_ID=workflow_bfsi_marketing_template
```

**Clerk:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**EmailJS:**
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_c0tjfha
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_61hft9i
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=ljHzTSLJWrKS542F0
```

**Demo Audio:**
```bash
GOOGLE_TTS_API_KEY=AQ.Ab8RN6Kkj8lMlrekeUM7au62eux9WWgyU8iYfAc1W6SyzoI5xA
```

### Deploy
- [ ] Click Deploy
- [ ] Wait for build (~2-3 min)
- [ ] Copy Vercel URL: `https://bfsi-campaign.vercel.app`

## Part 3: Update CORS

### Update Railway BFF
- [ ] Go to Railway → BFF service → Variables
- [ ] Update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://bfsi-campaign.vercel.app,https://www.yourdomain.com
```
- [ ] Service will auto-restart

### Update Clerk
- [ ] Go to Clerk dashboard → Applications
- [ ] Add Vercel URL to allowed origins
- [ ] Update redirect URLs if needed

## Part 4: Testing

### Test BFF Health
```bash
curl https://bfsi-bff-production.up.railway.app/api/v1/health
# Expected: {"status": "ok"}
```

### Test Frontend
- [ ] Visit Vercel URL
- [ ] Test signup/login with Clerk
- [ ] Upload CSV file
- [ ] Generate campaign
- [ ] Check demo tour with audio
- [ ] Test contact form (EmailJS)

### Test Integration
- [ ] Create campaign → Check BFF receives request
- [ ] Verify workflow backend is called
- [ ] Check compliance verification works
- [ ] Confirm results display correctly

## Post-Deployment

### Monitor Logs
- [ ] Railway: Check BFF logs for errors
- [ ] Vercel: Check frontend logs
- [ ] Test all critical user flows

### Set Up Alerts
- [ ] Railway → Project → Settings → Notifications
- [ ] Vercel → Project → Settings → Notifications

### Document URLs
- Frontend: `https://__________________.vercel.app`
- BFF Backend: `https://__________________.up.railway.app`
- Workflow Backend: `https://__________________.up.railway.app`

## Rollback Plan

### If BFF Fails
1. Railway → BFF service → Deployments
2. Select previous working deployment
3. Click "Redeploy"

### If Frontend Fails
1. Vercel → Deployments
2. Select previous working deployment
3. Click "..." → "Promote to Production"

## Common Issues

### BFF won't connect to database
- Check `DATABASE_URL` is set in Railway
- Verify PostgreSQL service is running
- Run migrations: `npx prisma migrate deploy`

### Frontend can't reach BFF
- Verify `NEXT_PUBLIC_BFF_URL` in Vercel
- Check CORS `ALLOWED_ORIGINS` includes Vercel URL
- Test BFF directly: `curl https://your-bff-url/api/v1/health`

### Clerk auth fails
- Ensure using **production** Clerk keys (not test keys)
- Add Vercel URL to Clerk dashboard
- Check redirect URLs match

### Demo audio not playing
- Verify audio files committed: `public/demo/audio/step-0.mp3` to `step-8.mp3`
- Check `GOOGLE_TTS_API_KEY` is set in Vercel
- Test audio URL: `https://your-app.vercel.app/demo/audio/step-0.mp3`

## Cost Summary
- Vercel (Hobby): **$0/month**
- Railway BFF: **~$5/month**
- Railway PostgreSQL: **~$5/month**
- **Total: ~$10/month**

---

**Deployment completed:** ___/___/______
**Deployed by:** ________________
**Frontend URL:** ________________
**Backend URL:** ________________
