# BFSI Campaign Generator - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** November 28, 2025
**Document Owner:** Vishnuu
**Status:** Completed

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Problem Statement](#3-problem-statement)
4. [Solution Overview](#4-solution-overview)
5. [Target Users](#5-target-users)
6. [User Personas](#6-user-personas)
7. [Features & Functional Requirements](#7-features--functional-requirements)
8. [User Workflows](#8-user-workflows)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Success Metrics](#10-success-metrics)
11. [Compliance & Security](#11-compliance--security)
12. [Roadmap & Future Enhancements](#12-roadmap--future-enhancements)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

### 1.1 Product Vision

The BFSI (Banking, Financial Services, and Insurance) Campaign Generator is an AI-powered marketing automation platform designed to help BFSI marketers create compliant, personalized customer communication at scale. The platform combines advanced AI content generation with regulatory compliance checking to ensure all marketing messages meet stringent BFSI industry requirements.

### 1.2 Key Objectives

- **Automate** the creation of personalized marketing campaigns for BFSI customers
- **Ensure** regulatory compliance with RBI, SEBI, IRDAI, TRAI, and DPDPA guidelines
- **Provide** explainable AI (XAI) insights into content generation and compliance decisions
- **Enable** marketers to generate campaigns in minutes instead of days

### 1.3 Success Criteria

- **Launch MVP** with 100 free-tier campaigns per user
- **Achieve** 95%+ compliance pass rate on generated content
- **Reduce** campaign creation time by 80% compared to manual process
- **Support** at max 10 rows (customers) per campaign
- **Provide** complete audit trail and explainability for all AI decisions

---

## 2. Product Overview

### 2.1 What is BFSI Campaign Generator?

The BFSI Campaign Generator is a three-tier web application that allows marketing teams to:

1. **Upload** customer data via CSV files
2. **Define** campaign objectives and messaging tone
3. **Generate** AI-powered personalized marketing content
4. **Validate** content against regulatory compliance rules
5. **Review** and approve generated messages with full transparency
6. **Export** approved content for delivery via WhatsApp/Email/SMS

### 2.2 Core Value Propositions

| Value Proposition   | Description                                                         | Impact            |
| ------------------- | ------------------------------------------------------------------- | ----------------- |
| **Speed**           | Generate 100 personalized messages in under 5 minutes               | 80% time savings  |
| **Compliance**      | Automated RAG-based compliance checking against 5 regulatory bodies | 100% audit trail  |
| **Transparency**    | XAI features explain why content was generated and scored           | Build trust       |
| **Personalization** | Context-aware AI adapts messaging to customer demographics          | Higher engagement |
| **Scalability**     | Cloud-native architecture supports concurrent campaigns             | Enterprise-ready  |

### 2.3 Key Differentiators

- **RAG-Powered Compliance**: BFSI tool with Retrieval-Augmented Generation for compliance
- **Dual XAI System**: Separate explainability for content generation AND compliance checking
- **Real Compliance Rules**: Hardcoded knowledge base of actual RBI/SEBI/IRDAI/TRAI/DPDPA regulations
- **Workflow Automation Integration**: Built on enterprise workflow engine for extensibility
- **Free Tier**: 100 campaigns/month free tier for market adoption

---

## 3. Problem Statement

### 3.1 Current Challenges in BFSI Marketing

#### 3.1.1 Manual Personalization is Time-Consuming

- Marketers spend 3-5 days creating personalized campaigns for 100 customers
- Copy-paste errors lead to incorrect customer names/details
- Limited ability to test multiple messaging variations

#### 3.1.2 Compliance is Complex and Risky

- BFSI industry governed by 5+ regulatory bodies (RBI, SEBI, IRDAI, TRAI, DPDPA)
- Single compliance violation can result in fines of ₹1 crore+
- Manual review of 100+ messages is error-prone
- No audit trail for compliance decisions

#### 3.1.3 Lack of Transparency in AI Tools

- Existing AI tools provide no explanation for generated content
- Compliance scores are "black box" with no reasoning
- Marketers cannot justify AI decisions to legal teams

#### 3.1.4 No Usage Control or Monetization

- No way to enforce usage limits for free vs paid tiers
- No tracking of campaigns generated per user
- No centralized user management

### 3.2 Market Opportunity

- **TAM (Total Addressable Market)**: 5,000+ BFSI companies in India
- **Target Segment**: Mid to large marketing teams (10-100 marketers)
- **Budget**: ₹5-20 lakhs per year for marketing automation tools
- **Pain Point Severity**: 8/10 (high compliance risk, manual work burden)

---

## 4. Solution Overview

### 4.1 Architecture Approach

The solution uses a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16)                                       │
│  - User interface for campaign creation                      │
│  - Real-time execution monitoring                            │
│  - XAI visualization components                              │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API + Auth (Clerk)
┌────────────────▼────────────────────────────────────────────┐
│  BFF (Backend-for-Frontend)                                  │
│  - User management & authentication                          │
│  - Usage tracking & limits enforcement                       │
│  - Request proxy to workflow backend                         │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API + API Key
┌────────────────▼────────────────────────────────────────────┐
│  Workflow Automation Backend (NestJS)                        │
│  - AI content generation (Gemini 2.5 Flash)                  │
│  - RAG-based compliance checking                             │
│  - XAI generation for transparency                           │
│  - Workflow orchestration engine                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Key Technologies

| Component            | Technology                           | Purpose                       |
| -------------------- | ------------------------------------ | ----------------------------- |
| **Frontend**         | Next.js 16, React 19, TailwindCSS    | Modern, responsive UI         |
| **Authentication**   | Clerk                                | User management, SSO          |
| **BFF**              | Express.js, PostgreSQL               | Usage tracking, rate limiting |
| **Workflow Backend** | NestJS, Prisma, PostgreSQL           | AI orchestration, compliance  |
| **AI Engine**        | Google Gemini 2.5 Flash              | Content generation, RAG       |
| **Deployment**       | Vercel (Frontend), Railway (Backend) | Cloud hosting                 |

### 4.3 Data Flow

1. **User uploads CSV** with customer data (name, phone, email, age, occupation, etc.)
2. **Frontend validates** CSV structure and row limits (max 10 rows)
3. **BFF enforces** usage limits (100 campaigns/month for free tier)
4. **BFF forwards** request to workflow backend with API key authentication
5. **Workflow backend executes** 4-node workflow:
   - **Node 1**: CSV Upload (parse and validate)
   - **Node 2**: AI Content Generation (personalized messages via Gemini)
   - **Node 3**: Compliance Checking (RAG-based validation against regulations)
   - **Node 4**: Manual Approval Gate (user reviews and approves)
6. **User reviews** generated content with:
   - Full message text for each customer
   - Compliance score (0-100%, where 100% = compliant)
   - Compliance violations (if any) with severity (Critical/High/Medium/Low)
   - XAI explanations for both content generation and compliance
7. **User approves or rejects** individual messages or entire campaign
8. **Approved content** is exported for delivery

---

## 7. Features & Functional Requirements

### 7.1 MVP Features (Current Release)

#### Feature 1: CSV Upload & Validation

**Description:** Users upload customer data via CSV file
**Priority:** P0 (Must-Have)
**User Story:** As a marketing manager, I want to upload customer data via CSV so that I can create personalized campaigns

**Acceptance Criteria:**

- [ ] Support CSV files with required columns: `customer_id`, `name`, `phone`, `email`, `age`, `occupation`
- [ ] Allow optional custom columns (e.g., `income`, `creditScore`)
- [ ] Validate CSV structure and provide clear error messages for missing columns
- [ ] Enforce 10-row limit per campaign (free tier)
- [ ] Display CSV preview with column headers and sample rows
- [ ] Sanitize CSV input to prevent XSS attacks

**Technical Notes:**

- Frontend validation using `react-dropzone` and `xlsx` library
- Backend validation in BFF before forwarding to workflow
- DOMPurify library for XSS protection

---

#### Feature 2: AI Content Generation

**Description:** Generate personalized marketing messages using AI
**Priority:** P0 (Must-Have)
**User Story:** As a marketing manager, I want to generate personalized messages for each customer so that I can engage them effectively

**Acceptance Criteria:**

- [ ] Accept custom campaign prompt (e.g., "Generate credit card offer highlighting cashback")
- [ ] Support 3 tones: Professional, Friendly, Urgent
- [ ] Generate unique message for each customer row
- [ ] Personalize content with customer data (name, age, occupation)
- [ ] Provide XAI explanation for each generated message
- [ ] Handle AI API failures gracefully with retry logic (3 attempts)

**Technical Notes:**

- Uses Google Gemini 2.5 Flash API
- Retry logic with exponential backoff
- XAI generated via separate Gemini prompt

---

#### Feature 3: RAG-Based Compliance Checking

**Description:** Validate generated content against BFSI regulations
**Priority:** P0 (Must-Have)
**User Story:** As a compliance officer, I want to ensure all generated content is compliant so that we avoid regulatory fines

**Acceptance Criteria:**

- [ ] Check content against RBI, SEBI, IRDAI, TRAI, DPDPA regulations
- [ ] Assign compliance score (0-100%, where 100% = compliant)
- [ ] Identify specific violations with severity (Critical/High/Medium/Low)
- [ ] Calculate risk score based on severity weighting:
  - Critical: +100 points
  - High: +30 points
  - Medium: +15 points
  - Low: +5 points
- [ ] Compliance % = 100 - risk_score (capped at 0%)
- [ ] Provide XAI explanation with:
  - Rule hits (which regulations were violated)
  - Evidence (text snippets that triggered violations)
  - Suggestions (how to fix violations)
  - Score breakdown (calculation formula)

**Technical Notes:**

- RAG implementation with hardcoded knowledge base (93-line compliance rules)
- No vector database required (simplified RAG)
- Gemini 2.5 Flash used for RAG analysis

---

#### Feature 4: Dual XAI System

**Description:** Provide explanations for both content generation and compliance decisions
**Priority:** P0 (Must-Have)
**User Story:** As a legal team member, I want to understand why AI made specific decisions so that I can justify them to regulators

**Acceptance Criteria:**

- [ ] **Content Generation XAI:**
  - Reasoning trace (step-by-step thought process)
  - Decision factors (key aspects considered)
  - Confidence score (0-1)
- [ ] **Compliance XAI:**
  - Score breakdown (calculation formula, e.g., "2 MEDIUM (15×2) = 30 total risk")
  - Violations by severity (count of Critical/High/Medium/Low)
  - Rule hits (specific regulations violated)
  - Evidence (text snippets from knowledge base)
  - Confidence score
- [ ] Display XAI in dedicated UI panels with:
  - Collapsible sections
  - Color-coded severity indicators
  - Copy-to-clipboard functionality

**Technical Notes:**

- XAI data stored in `xai` and `compliance_xai` fields (JSONB)
- UI components: `XaiPanel.tsx`, `ComplianceXaiPanel.tsx`

---

#### Feature 5: Manual Approval Workflow

**Description:** Users review and approve generated content before export
**Priority:** P0 (Must-Have)
**User Story:** As a marketing manager, I want to review generated content before sending so that I can ensure quality

**Acceptance Criteria:**

- [ ] Display all generated messages in a table with:
  - Customer name
  - Generated message (truncated with "Read More")
  - Compliance score (color-coded: Red <70%, Yellow 70-90%, Green >90%)
  - Compliance status (Pass/Fail)
  - Violations (expandable list)
- [ ] Provide actions:
  - Approve individual message
  - Reject individual message (with option to regenerate)
  - Approve all (bulk action)
  - Reject all (bulk action)
- [ ] Track approval decisions:
  - Approved messages move to "Ready to Send"
  - Rejected messages can be regenerated or edited
- [ ] Export approved messages:
  - CSV download
  - Copy to clipboard
  - API integration (future)

**Technical Notes:**

- Approval state stored in workflow backend database
- WebSocket real-time updates for status changes

---

#### Feature 6: Usage Tracking & Limits

**Description:** Track campaign usage and enforce tier-based limits
**Priority:** P0 (Must-Have)
**User Story:** As an IT admin, I want to enforce usage limits so that we can monetize the platform with free/paid tiers

**Acceptance Criteria:**

- [ ] Track per user:
  - Campaigns generated (count)
  - Rows processed (count)
  - Period start/end (monthly reset)
- [ ] Enforce limits:
  - Free tier: 100 campaigns/month, 1000 rows/month
  - 10 rows per campaign (hard limit)
- [ ] Display usage stats on dashboard:
  - "You've used X of 100 campaigns this month"
  - "You've processed Y of 1000 rows this month"
  - Progress bars with color-coded warnings (>80% = yellow)
- [ ] Block campaign creation when limits exceeded:
  - Clear error message
  - "Upgrade Plan" CTA

**Technical Notes:**

- Usage stored in BFF PostgreSQL database (`usage_stats` table)
- Foreign key constraint requires user to exist in `users` table
- Upsert pattern for atomic increment operations

---

#### Feature 7: User Authentication & Management

**Description:** Secure user authentication and profile management
**Priority:** P0 (Must-Have)
**User Story:** As a user, I want to sign in securely so that my campaigns are private

**Acceptance Criteria:**

- [ ] Support email/password and SSO (Google, Microsoft)
- [ ] User profile with:
  - Name
  - Email
  - Plan (Free/Starter/Pro/Enterprise)
  - Usage stats
- [ ] Automatic user creation on first sign-in (upsert pattern)
- [ ] Session management with JWT tokens
- [ ] Role-based access control (future)

**Technical Notes:**

- Clerk authentication platform
- BFF creates user record on first API call
- User ID from Clerk JWT used as primary key

---

### 7.2 Future Features (Post-MVP)

#### Feature 8: A/B Testing

**Description:** Generate multiple message variations and test performance
**Priority:** P1 (Should-Have)
**Timeline:** Q2 2025

#### Feature 9: Multi-Channel Delivery

**Description:** Send approved messages via WhatsApp, Email, SMS directly from platform
**Priority:** P1 (Should-Have)
**Timeline:** Q2 2025

#### Feature 10: Advanced Analytics

**Description:** Campaign performance dashboards (open rates, click rates, conversions)
**Priority:** P2 (Nice-to-Have)
**Timeline:** Q3 2025

#### Feature 11: Template Library

**Description:** Pre-built campaign templates for common use cases (credit card, loan, insurance)
**Priority:** P2 (Nice-to-Have)
**Timeline:** Q3 2025

#### Feature 12: Multi-Language Support

**Description:** Generate content in Hindi, Tamil, Telugu, Bengali
**Priority:** P2 (Nice-to-Have)
**Timeline:** Q4 2025

### 8.0 Document History

| Version | Date       | Author  | Changes              |
| ------- | ---------- | ------- | -------------------- |
| 1.0     | 2025-11-28 | Vishnuu | Initial PRD creation |

---

**END OF DOCUMENT**
