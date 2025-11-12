# Email Setup Guide

The contact form sends emails to `chithu@newgendigital.com` when users submit the form.

## Prerequisites

You need an email account with SMTP access. Gmail is recommended for ease of setup.

## Setup Instructions

### Option 1: Gmail (Recommended)

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification" and follow the steps to enable it

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "BFSI Campaign Generator" as the name
   - Click "Generate"
   - Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env.local**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Option 2: SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API Key
3. Update .env.local:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Option 3: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your SMTP credentials from the dashboard
3. Update .env.local:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   ```

## Testing Email

After configuring SMTP credentials:

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3002/contact

3. Fill out and submit the form

4. Check the server console for email sending status

5. Verify email received at chithu@newgendigital.com

## Email Template

The email sent includes:

- **Subject**: Contact Form: [Subject Type] - [User Name]
- **From**: BFSI Campaign Generator
- **Reply-To**: User's email address
- **Content**:
  - Subject type (General Inquiry, Sales & Pricing, etc.)
  - Full Name
  - Email Address
  - Company (if provided)
  - Phone Number (if provided)
  - Message

The email is sent in both plain text and HTML format for better compatibility.

## Production Deployment

For Vercel deployment, add the environment variables:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`

4. Redeploy the application

## Troubleshooting

### Error: "Invalid login"
- For Gmail: Ensure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled
- Check that the email and password are correct

### Error: "Connection timeout"
- Verify SMTP_HOST and SMTP_PORT are correct
- Check your firewall settings
- Try port 465 with secure: true for SSL connection

### Email not received
- Check spam/junk folder
- Verify the recipient email (chithu@newgendigital.com) is correct
- Check server logs for error messages
- Test with a different SMTP provider

## Security Notes

- Never commit .env.local to version control
- Use App Passwords for Gmail (never use your main password)
- Rotate SMTP credentials periodically
- Use environment variables in production (Vercel Environment Variables)
