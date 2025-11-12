import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter using Gmail SMTP
    // You'll need to set these environment variables:
    // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Map subject to readable format
    const subjectMap: { [key: string]: string } = {
      general: 'General Inquiry',
      sales: 'Sales & Pricing',
      support: 'Technical Support',
      partnership: 'Partnership Opportunities',
      feedback: 'Feedback & Suggestions',
    };

    const subjectText = subjectMap[subject] || subject;

    // Build email content
    let emailContent = `
New Contact Form Submission - BFSI Campaign Generator

Subject: ${subjectText}

Contact Details:
- Name: ${name}
- Email: ${email}`;

    if (company) {
      emailContent += `\n- Company: ${company}`;
    }

    if (phone) {
      emailContent += `\n- Phone: ${phone}`;
    }

    emailContent += `\n\nMessage:\n${message}

---
This email was sent from the BFSI Campaign Generator contact form.
`;

    // Send email
    const info = await transporter.sendMail({
      from: `"BFSI Campaign Generator" <${process.env.SMTP_USER}>`,
      to: 'chithu@newgendigital.com',
      replyTo: email,
      subject: `Contact Form: ${subjectText} - ${name}`,
      text: emailContent,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .field {
      margin-bottom: 15px;
    }
    .label {
      font-weight: bold;
      color: #1f2937;
    }
    .value {
      color: #4b5563;
      margin-top: 5px;
    }
    .message-box {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
      white-space: pre-wrap;
    }
    .footer {
      background: #f3f4f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Contact Form Submission</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">BFSI Campaign Generator</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${subjectText}</div>
      </div>

      <div class="field">
        <div class="label">Full Name:</div>
        <div class="value">${name}</div>
      </div>

      <div class="field">
        <div class="label">Email Address:</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>

      ${company ? `
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">${company}</div>
      </div>
      ` : ''}

      ${phone ? `
      <div class="field">
        <div class="label">Phone Number:</div>
        <div class="value"><a href="tel:${phone}">${phone}</a></div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Message:</div>
        <div class="message-box">${message}</div>
      </div>
    </div>
    <div class="footer">
      This email was sent from the BFSI Campaign Generator contact form<br>
      Reply directly to this email to respond to ${name}
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log('Email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
