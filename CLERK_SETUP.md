# Clerk Authentication Setup Guide

Clerk provides complete user authentication and session management with minimal setup. This guide will help you set up Clerk for the BFSI Campaign Generator.

## Quick Setup (5 minutes)

### Step 1: Create Clerk Account

1. Go to [Clerk](https://clerk.com/)
2. Click "Start building for free" or "Sign up"
3. Sign up with your email or GitHub account
4. Verify your email address

### Step 2: Create Application

1. After signing in, you'll be prompted to create your first application
2. Click "Create Application"
3. Enter application details:
   - **Name**: BFSI Campaign Generator
   - **Sign-in options**: Select **Email** and **Password** (recommended)
   - Optional: Add Google, GitHub, or other OAuth providers
4. Click "Create Application"

### Step 3: Get API Keys

After creating the application, you'll see your API keys:

1. From the Clerk Dashboard, go to **API Keys** (in the left sidebar)
2. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret Key** (starts with `sk_test_...` or `sk_live_...`)

⚠️ **Important**: Keep your Secret Key private! Never commit it to version control or expose it in client-side code.

### Step 4: Configure URLs

In the Clerk Dashboard:

1. Go to **Paths** (in the left sidebar)
2. Configure these paths:
   - **Sign-in URL**: `/login`
   - **Sign-up URL**: `/signup`
   - **Home URL**: `/`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/dashboard`

3. Go to **Domains** (in the left sidebar)
4. Add your development URL:
   - Click "Add domain"
   - Enter `http://localhost:3002` (or your dev port)
   - Click "Add"

### Step 5: Update Environment Variables

Update your `.env.local` file with your actual Clerk keys:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# Clerk URL Configuration (already set correctly)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 6: Restart Development Server

After updating the environment variables:

```bash
# Stop the current dev server (Ctrl+C)
# Restart it
pnpm dev
```

### Step 7: Test Authentication

1. Go to http://localhost:3002/signup
2. Create a test account with your email
3. You should receive a verification email
4. After verification, you'll be redirected to `/dashboard`
5. Try logging out and logging back in at `/login`

## Authentication Features Included

✅ **Sign Up** - User registration with email verification
✅ **Sign In** - Secure login with session management
✅ **Sign Out** - Logout functionality
✅ **Protected Routes** - Automatic redirect if not authenticated
✅ **User Profile** - Built-in user management
✅ **Session Management** - Secure JWT-based sessions
✅ **Password Reset** - Forgot password flow

## Protected Routes

The following routes require authentication:
- `/dashboard` - Main dashboard
- `/create` - Campaign creation
- `/approval` - Campaign approval
- `/results/*` - Campaign results

Unauthenticated users will be automatically redirected to `/login`.

## User Management

### Viewing Users
1. Go to Clerk Dashboard
2. Click "Users" in the left sidebar
3. See all registered users, their status, and last sign-in

### Managing Users
- **Delete users**: Click on a user → Delete button
- **Ban users**: Click on a user → Ban button
- **Reset passwords**: Click on a user → Send password reset email

## Security Features

🔒 **Automatic Security**:
- Email verification required
- Secure password hashing
- JWT-based sessions
- CSRF protection
- Rate limiting on auth endpoints
- Automatic session refresh

## Free Tier Limits

- **5,000 monthly active users** (free)
- Unlimited applications
- All authentication methods
- Basic support

Upgrade to Pro ($25/month) for:
- 10,000+ monthly active users
- Advanced security features
- Priority support

## Troubleshooting

### "Clerk: Missing publishableKey"
- Check that `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart your dev server after adding the key
- Ensure the key starts with `pk_test_` or `pk_live_`

### "Invalid secret key"
- Verify `CLERK_SECRET_KEY` in `.env.local`
- Ensure the key starts with `sk_test_` or `sk_live_`
- Make sure there are no extra spaces or quotes

### Redirect loops
- Check that URLs in Clerk Dashboard match your app routes
- Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- Ensure middleware is not protecting auth pages

### Email verification not working
- Check spam/junk folder
- Verify email settings in Clerk Dashboard
- In development, check Clerk Dashboard for verification link

## Production Deployment

For Vercel/production deployment:

1. Go to your hosting platform (e.g., Vercel)
2. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (use production key: `pk_live_...`)
   - `CLERK_SECRET_KEY` (use production key: `sk_live_...`)
   - All other `NEXT_PUBLIC_CLERK_*` variables
3. In Clerk Dashboard, switch to **Production** instance
4. Add your production domain to **Domains**
5. Redeploy your application

## Need Help?

- Clerk Documentation: https://clerk.com/docs
- Clerk Dashboard: https://dashboard.clerk.com/
- Support: support@clerk.com
- Next.js Integration: https://clerk.com/docs/quickstarts/nextjs

## Migration from Existing Auth

If you have existing users, you can:
1. Export user data from current system
2. Use Clerk's User Import API
3. Send password reset emails to all users
4. Users can set new passwords and continue

Contact Clerk support for migration assistance.
