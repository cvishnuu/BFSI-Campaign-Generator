# BFSI Campaign Generator - Technical Documentation

**Version:** 1.0
**Last Updated:** 2025-01-30
**Project Repository:** bfsi-campaign-generator

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Component Breakdown](#3-component-breakdown)
4. [Database Schema](#4-database-schema)
5. [API Documentation](#5-api-documentation)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Development Setup](#9-development-setup)
10. [Testing Strategy](#10-testing-strategy)
11. [Code Patterns & Conventions](#11-code-patterns--conventions)
12. [Integration Points](#12-integration-points)
13. [Troubleshooting Guide](#13-troubleshooting-guide)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

The BFSI Campaign Generator follows a **three-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Next.js 14 Frontend (Port 3000)                   │     │
│  │  - React 18 + TypeScript                           │     │
│  │  - TailwindCSS + ShadCN UI                         │     │
│  │  - Clerk Authentication                            │     │
│  │  - Client-side form validation                     │     │
│  │  - CSV parsing (Papa Parse)                        │     │
│  │  - XSS sanitization (DOMPurify)                    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (Clerk JWT)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  BFF - Backend for Frontend (Port 5001)            │     │
│  │  - Express.js + TypeScript                         │     │
│  │  - Clerk JWT validation                            │     │
│  │  - Usage tracking & limits enforcement             │     │
│  │  - Request sanitization                            │     │
│  │  - PostgreSQL connection (usage stats)             │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP (API Key Bearer Token)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       WORKFLOW TIER                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Workflow Automation Backend (Port 3001)           │     │
│  │  - NestJS + TypeScript                             │     │
│  │  - API Key authentication                          │     │
│  │  - Workflow execution engine                       │     │
│  │  - Node executors (AI, Compliance, WhatsApp)       │     │
│  │  - RAG-based compliance checking                   │     │
│  │  - Dual XAI system                                 │     │
│  │  - PostgreSQL (workflows, executions, audit)       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  - Google Gemini 2.5 Flash (AI generation)                  │
│  - Google Gemini Pro (RAG compliance)                        │
│  - WhatsApp Business API (message delivery)                 │
│  - Clerk (authentication provider)                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Request Lifecycle

**Example: Creating a Campaign**

1. **User uploads CSV** → Frontend validates (required columns, max 10 rows)
2. **User submits campaign** → Frontend sanitizes inputs, calls BFF with Clerk JWT
3. **BFF validates JWT** → Extracts user context (userId, email, name)
4. **BFF upserts user** → Ensures user exists in database
5. **BFF checks usage limits** → Queries `usage_stats` table (100 campaigns/month, 1000 rows/month)
6. **BFF increments usage** → Atomic upsert into `usage_stats`
7. **BFF proxies to workflow** → Calls workflow backend `/public/agents/{id}/execute` with API key
8. **Workflow executes nodes**:
   - **Trigger Node** → Validates execution input
   - **AI Content Generator** → Calls Gemini API with prompt + CSV row data
   - **Compliance Checker** → RAG-based validation against BFSI regulations
   - **Approval Gate** → Workflow pauses, returns results to frontend
9. **User reviews results** → Frontend displays messages, compliance scores, XAI explanations
10. **User approves/rejects** → Frontend calls `/approve` or `/reject` endpoint
11. **Workflow resumes** → If approved, sends messages via WhatsApp API

---

## 2. Technology Stack

### 2.1 Frontend (Next.js App)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI component library |
| TypeScript | 5.x | Type-safe development |
| TailwindCSS | 3.x | Utility-first CSS framework |
| ShadCN UI | Latest | Accessible component library |
| Clerk | 5.x | Authentication & user management |
| Papa Parse | 5.x | CSV parsing library |
| isomorphic-dompurify | 2.x | XSS sanitization |
| Zustand | 4.x | State management (optional) |

### 2.2 BFF (Backend for Frontend)

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.x | Lightweight web framework |
| TypeScript | 5.x | Type-safe backend development |
| @clerk/express | 1.x | Clerk JWT validation |
| pg | 8.x | PostgreSQL client |
| zod | 3.x | Request validation |
| axios | 1.x | HTTP client for workflow backend |

### 2.3 Workflow Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.x | Enterprise Node.js framework |
| TypeScript | 5.x | Type-safe backend development |
| Prisma | 5.x | ORM for PostgreSQL |
| PostgreSQL | 15.x | Relational database |
| @google/generative-ai | Latest | Google Gemini API client |
| Socket.io | 4.x | Real-time WebSocket communication |
| class-validator | 0.14.x | DTO validation |
| crypto (Node.js) | Built-in | API key hashing, HMAC signing |

### 2.4 External Services

| Service | Purpose |
|---------|---------|
| Google Gemini 2.5 Flash | AI content generation (4000 token output) |
| Google Gemini Pro | RAG-based compliance checking (8000 token XAI) |
| WhatsApp Business API | Message delivery to customers |
| Clerk | User authentication & session management |
| Railway/Render | Backend hosting (planned) |
| Vercel | Frontend hosting (planned) |

---

## 3. Component Breakdown

### 3.1 Frontend Components

#### 3.1.1 Page Components

**`app/create/page.tsx`** (419 lines)
- Main campaign creation UI
- CSV upload with drag-and-drop
- Campaign prompt input (sanitized)
- Tone selection (professional/friendly/urgent)
- Usage stats display (live from BFF)
- Limit enforcement UI (warnings, dialogs)
- Form validation and submission
- **Key Functions**:
  - `handleCsvUpload()`: Parses CSV, validates columns
  - `handleSubmit()`: Validates limits, calls BFF, redirects to execution page
  - `fetchUsage()`: Retrieves live usage stats from BFF

**`app/execution/[executionId]/page.tsx`** (estimated 300+ lines)
- Real-time execution monitoring
- Message review interface
- Compliance violation display
- XAI explanation panels
- Approve/reject controls
- **Key Features**:
  - Polls execution status every 2 seconds
  - Displays generated messages in table format
  - Shows compliance scores with color-coded badges
  - Renders dual XAI (content + compliance)
  - Handles approval/rejection workflow

**`app/dashboard/page.tsx`** (estimated 200+ lines)
- User dashboard with campaign history
- Usage statistics overview
- Quick action buttons
- Recent campaigns list

**`app/login/page.tsx`**
- Clerk authentication wrapper
- Sign-in/sign-up forms

#### 3.1.2 Reusable Components

**`components/csv-upload.tsx`** (estimated 150+ lines)
- Drag-and-drop file upload
- CSV parsing with Papa Parse
- Column validation (required: customer_id, name, phone, email, age, location, occupation)
- Row limit enforcement (max 10 rows)
- XSS sanitization of CSV data
- Preview table display

**`components/column-preview.tsx`** (estimated 100+ lines)
- Displays detected CSV columns
- Shows missing required columns
- Sample data preview
- Validation status indicators

**`components/ui/*`** (ShadCN UI components)
- `button.tsx`: Customizable button component
- `card.tsx`: Card container with header/content
- `dialog.tsx`: Modal dialog component
- `badge.tsx`: Status badges
- `label.tsx`: Form labels
- `textarea.tsx`: Multi-line text input

#### 3.1.3 Libraries & Utilities

**`lib/bff-api.ts`** (estimated 100 lines)
- BFF API client
- Clerk token injection
- Endpoints:
  - `getUsage(token)`: Fetch usage stats
  - `startCampaign(data, token)`: Create campaign execution

**`lib/sanitize.ts`** (estimated 50 lines)
- XSS sanitization utilities
- Uses isomorphic-dompurify
- Functions:
  - `sanitizeInput(value)`: Sanitize single string
  - `sanitizeObject(obj)`: Recursive object sanitization
  - `sanitizeCsvData(rows)`: Sanitize CSV array

**`lib/api.ts`** (workflow backend client - legacy, should not be used directly)
- Direct workflow backend API client
- **IMPORTANT**: Frontend should NEVER call this directly; always use `bff-api.ts`

**`types/index.ts`** (138 lines)
- Shared TypeScript types
- Key interfaces:
  - `CsvRow`: Customer data structure
  - `UsageStats`: Usage tracking data
  - `ExecutionResponse`: Campaign execution result
  - `GeneratedContentRow`: AI-generated message with compliance data
  - `XaiMetadata`: Explainable AI metadata
  - `ComplianceXaiMetadata`: Compliance-specific XAI

### 3.2 BFF Components

#### 3.2.1 Routes

**`src/routes/index.ts`** (216 lines)
- All BFF endpoints
- Clerk JWT validation middleware (`requireAuth()`)
- User context extraction (`getUserContext()`)
- Request validation with Zod

**Endpoints**:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | None | Health check |
| GET | `/me` | Clerk JWT | Get current user info |
| GET | `/usage` | Clerk JWT | Get usage statistics |
| POST | `/campaigns/execute` | Clerk JWT | Create campaign (tracks usage, proxies to workflow) |
| GET | `/campaigns/:id/status` | Clerk JWT | Get execution status (mock) |
| GET | `/campaigns/:id/results` | Clerk JWT | Get execution results (mock) |
| GET | `/campaigns/:id/pending-approval` | Clerk JWT | Get approval data (mock) |
| POST | `/campaigns/:id/approve` | Clerk JWT | Approve campaign (mock) |
| POST | `/campaigns/:id/reject` | Clerk JWT | Reject campaign (mock) |

**IMPORTANT**: Status, results, pending-approval, approve, reject endpoints are currently MOCKS. The real implementation should proxy these to the workflow backend.

#### 3.2.2 Services

**`src/services/user-service.ts`** (estimated 80 lines)
- PostgreSQL connection pool
- User CRUD operations
- Usage tracking

**Functions**:
- `upsertUser(userId, email, name)`: Create/update user in `users` table
- `getUsage(userId)`: Query `usage_stats` table
- `incrementUsage(userId, campaigns, rows)`: Atomic upsert with increment

**SQL Schema (BFF Database)**:
```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE usage_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  campaigns_generated INTEGER DEFAULT 0,
  rows_processed INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT date_trunc('month', now()),
  period_end TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3.2.3 Configuration

**`src/server.ts`** (estimated 50 lines)
- Express app initialization
- Middleware: CORS, JSON parser, Clerk
- Routes registration
- Error handling middleware

**Environment Variables**:
```bash
PORT=5001
DATABASE_URL=postgresql://bfsi_user:password@localhost:5432/bfsi_campaigns
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WORKFLOW_API_URL=http://localhost:3001/api/v1
WORKFLOW_API_KEY=wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
```

### 3.3 Workflow Backend Components

#### 3.3.1 Public API Module

**`src/public-api/public-api.controller.ts`** (estimated 200 lines)
- Public-facing REST API endpoints
- API key authentication guard
- Rate limiting (10 req/burst, 60 req/min per API key)
- CSV row truncation (max 100 rows)

**Endpoints**:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/public/agents/:workflowId/execute` | API Key | Execute workflow agent |
| GET | `/public/executions/:id/status` | API Key | Get execution status |
| GET | `/public/executions/:id/results` | API Key | Get execution results |
| GET | `/public/executions/:id/pending-approval` | API Key | Get approval data |
| POST | `/public/executions/:id/approve` | API Key | Approve and resume workflow |
| POST | `/public/executions/:id/reject` | API Key | Reject and regenerate content |

**`src/public-api/guards/api-key.guard.ts`** (estimated 100 lines)
- Extracts Bearer token from `Authorization` header
- Validates API key against database (SHA-256 hash comparison)
- Checks API key status (active/revoked)
- Tracks usage count (increments on each request)
- Attaches API key metadata to request object

**`src/public-api/guards/rate-limit.guard.ts`** (estimated 150 lines)
- Token bucket algorithm
- Per-API-key rate limiting
- Configurable: 10 req burst, 60 req/min refill rate
- Returns 429 Too Many Requests when exceeded

#### 3.3.2 BFSI Workflow Module

**`src/bfsi/bfsi.module.ts`**
- Module definition for BFSI-specific nodes
- Registers custom node executors
- Imports ComplianceRAGModule

**`src/bfsi/executors/ai-content-generator.executor.ts`** (estimated 200 lines)
- Extends `BaseNodeExecutor`
- Calls Google Gemini 2.5 Flash API
- Generates personalized marketing messages
- Execution input override (prompt from API takes precedence)
- Variable substitution (`{{name}}`, `{{age}}`, etc.)
- XAI metadata generation:
  - `reasoningTrace`: Step-by-step AI reasoning
  - `decisionFactors`: Key personalization factors
  - `confidence`: Generation confidence score (0-1)

**`src/bfsi/executors/compliance-checker.executor.ts`** (estimated 250 lines)
- Extends `BaseNodeExecutor`
- Injects `ComplianceRAGService` and `AuditService`
- Calls RAG-based compliance checking
- Calculates compliance score (additive: 0 = pass, 100 = fail)
- Severity weights: CRITICAL=40, HIGH=25, MEDIUM=15, LOW=5
- Compliance XAI metadata:
  - `ruleHits`: Matched compliance rules with evidence
  - `scoreBreakdown`: Detailed score calculation formula
  - `evidence`: Text excerpts triggering violations
- Saves audit trail to database if `saveToAudit: true`

**`src/bfsi/executors/whatsapp-sender.executor.ts`** (estimated 100 lines)
- Extends `BaseNodeExecutor`
- Sends messages via WhatsApp Business API
- Message delivery confirmation
- Error handling and retries

**`src/bfsi/services/file-upload.service.ts`** (326 lines)
- CSV validation service
- Required columns (case-insensitive):
  - `customer_id`
  - `name`
  - `age`
  - `phone`
  - `email`
  - `occupation`
- Column normalization (snake_case conversion)
- Data type validation
- Missing column error messages

#### 3.3.3 Compliance RAG Module

**`src/compliance-rag/compliance-rag.service.ts`** (estimated 300 lines)
- RAG-based compliance validation
- Hardcoded knowledge base (93 lines):
  - RBI (Reserve Bank of India)
  - SEBI (Securities and Exchange Board of India)
  - IRDAI (Insurance Regulatory and Development Authority)
  - TRAI (Telecom Regulatory Authority of India)
  - DPDPA (Digital Personal Data Protection Act)
- Calls Google Gemini Pro with knowledge base + content
- Parses structured JSON response:
  ```json
  {
    "isPassed": true,
    "riskScore": 15,
    "violations": [
      {
        "term": "guaranteed returns",
        "severity": "critical",
        "reason": "Prohibited: Cannot guarantee investment returns"
      }
    ],
    "suggestions": [
      "Remove 'guaranteed' language",
      "Add 'subject to market risks' disclaimer"
    ]
  }
  ```
- Triple fallback mechanism:
  1. No API key → basic keyword check
  2. Gemini API error → basic keyword check
  3. JSON parse error → safe default (passed: false, score: 100)

**`src/compliance-rag/compliance-rag.module.ts`**
- Registers ComplianceRAGService globally
- Exported for injection into other modules

#### 3.3.4 Workflow Engine

**`src/executions/workflow-engine.service.ts`** (estimated 500+ lines)
- Orchestrates workflow execution
- Directed graph traversal (topological sort)
- Node executor factory pattern
- Event emitter for real-time updates
- Error handling and rollback
- Execution logging to database

**Execution Flow**:
1. Validate workflow definition (no cycles, all nodes connected)
2. Topological sort to determine execution order
3. For each node:
   - Resolve executor from factory
   - Execute node with input data
   - Log result to `node_executions` table
   - Emit WebSocket event (`node:started`, `node:completed`, `node:failed`)
4. Handle approval gates (pause execution, wait for user action)
5. Resume on approval, regenerate on rejection

**`src/nodes/executors/executor.factory.ts`** (estimated 100 lines)
- Factory pattern for node executors
- Maps node types to executor classes:
  - `trigger` → `TriggerNodeExecutor`
  - `ai-content-generator` → `AIContentGeneratorExecutor`
  - `compliance-checker` → `ComplianceCheckerExecutor`
  - `whatsapp-sender` → `WhatsAppSenderExecutor`
  - `http-request` → `HttpRequestExecutor`
  - `conditional` → `ConditionalExecutor`
  - `data-transform` → `DataTransformExecutor`

**`src/nodes/executors/base-node.executor.ts`** (estimated 100 lines)
- Abstract base class for all executors
- Template method pattern
- Common lifecycle methods:
  - `validate()`: Validate node configuration
  - `execute()`: Execute node logic (abstract)
  - `handleError()`: Error handling and logging
  - `cleanup()`: Resource cleanup

#### 3.3.5 API Key Management Module

**`src/api-keys/api-keys.controller.ts`** (estimated 150 lines)
- Admin endpoints for API key CRUD
- Clerk authentication required

**Endpoints**:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api-keys` | Clerk | Create new API key |
| GET | `/api-keys` | Clerk | List all API keys |
| GET | `/api-keys/:id` | Clerk | Get API key details |
| GET | `/api-keys/:id/usage` | Clerk | Get usage statistics |
| PATCH | `/api-keys/:id` | Clerk | Update API key |
| POST | `/api-keys/:id/regenerate` | Clerk | Regenerate API key (rotates secret) |
| DELETE | `/api-keys/:id` | Clerk | Delete API key (revokes access) |

**`src/api-keys/api-keys.service.ts`** (estimated 200 lines)
- Business logic for API key management
- Generates cryptographically secure keys
- SHA-256 hashing for storage
- Usage statistics aggregation

#### 3.3.6 Database (Prisma)

**`prisma/schema.prisma`** (estimated 500 lines)

**Key Models**:

```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workflows       Workflow[]
  apiKeys         ApiKey[]
  auditLogs       AuditLog[]
}

model Workflow {
  id          String   @id @default(uuid())
  name        String
  description String?
  definition  Json     // Workflow graph structure
  status      String   @default("draft")
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [clerkId])

  executions  WorkflowExecution[]
}

model WorkflowExecution {
  id            String   @id @default(uuid())
  workflowId    String
workflow      Workflow @relation(fields: [workflowId], references: [id])
  status        String   @default("pending")
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  error         String?
  input         Json?
  output        Json?

  nodeExecutions NodeExecution[]
}

model NodeExecution {
  id          String   @id @default(uuid())
  executionId String
  execution   WorkflowExecution @relation(fields: [executionId], references: [id])
  nodeId      String
  nodeType    String
  status      String   @default("pending")
  startedAt   DateTime @default(now())
  completedAt DateTime?
  input       Json?
  output      Json?
  error       String?
  metadata    Json?    // XAI data stored here
}

model ApiKey {
  id          String   @id @default(uuid())
  name        String
  keyHash     String   @unique  // SHA-256 hash
  userId      String
  user        User     @relation(fields: [userId], references: [clerkId])
  status      String   @default("active")
  usageCount  Int      @default(0)
  usageLimit  Int      @default(1000)
  createdAt   DateTime @default(now())
  revokedAt   DateTime?

  webhookUrl    String?
  webhookEvents String[] @default([])
  webhookSecret String?
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [clerkId])
  action      String
  resource    String
  details     Json?
  timestamp   DateTime @default(now())
}
```

---

## 4. Database Schema

### 4.1 BFF Database (`bfsi_campaigns`)

**Purpose**: User management and usage tracking

```sql
-- Users table
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,           -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage statistics table
CREATE TABLE usage_stats (
  user_id TEXT PRIMARY KEY,
  campaigns_generated INTEGER DEFAULT 0,
  rows_processed INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT date_trunc('month', now()),
  period_end TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_stats_period ON usage_stats(period_start, period_end);
```

### 4.2 Workflow Database

**Purpose**: Workflow definitions, executions, and audit trail

See Prisma schema above for complete entity-relationship model.

**Key Relationships**:
- `User` 1→N `Workflow` (one user creates many workflows)
- `User` 1→N `ApiKey` (one user owns many API keys)
- `Workflow` 1→N `WorkflowExecution` (one workflow has many executions)
- `WorkflowExecution` 1→N `NodeExecution` (one execution runs many nodes)
- `User` 1→N `AuditLog` (one user generates many audit logs)

---

## 5. API Documentation

### 5.1 BFF API

**Base URL**: `http://localhost:5001`

#### 5.1.1 Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok"
}
```

#### 5.1.2 Get Current User

```http
GET /me
Authorization: Bearer <CLERK_JWT_TOKEN>
```

**Response**:
```json
{
  "user": {
    "user_id": "user_34CVC4vAJIDZAJQ4N12degrk4P3",
    "email": "cvishnuu01@gmail.com",
    "name": "Vishnu C",
    "created_at": "2025-01-25T10:00:00Z",
    "updated_at": "2025-01-25T10:00:00Z"
  }
}
```

#### 5.1.3 Get Usage Statistics

```http
GET /usage
Authorization: Bearer <CLERK_JWT_TOKEN>
```

**Response**:
```json
{
  "usage": {
    "campaigns_generated": 5,
    "rows_processed": 50,
    "period_start": "2025-01-01T00:00:00Z",
    "period_end": "2025-02-01T00:00:00Z"
  }
}
```

#### 5.1.4 Create Campaign

```http
POST /campaigns/execute
Authorization: Bearer <CLERK_JWT_TOKEN>
Content-Type: application/json

{
  "csvData": [
    {
      "customerId": "1",
      "name": "Rajesh Kumar",
      "phone": "+919876543210",
      "email": "rajesh@example.com",
      "age": 35,
      "city": "Mumbai",
      "country": "India",
      "occupation": "Software Engineer"
    }
  ],
  "prompt": "Generate a personalized credit card offer highlighting cashback benefits",
  "tone": "professional"
}
```

**Success Response (201)**:
```json
{
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "status": "pending",
  "message": "Execution started successfully"
}
```

**Error Response - Row Limit (400)**:
```json
{
  "error": "Row limit exceeded",
  "message": "Maximum 10 rows allowed per campaign. You uploaded 15 rows. Please reduce the number of rows and try again.",
  "limit": 10,
  "provided": 15
}
```

**Error Response - Campaign Limit (403)**:
```json
{
  "error": "Campaign limit reached",
  "message": "You have reached your free tier limit of 100 campaigns. Please upgrade your plan to continue.",
  "limit": 100,
  "current": 100
}
```

### 5.2 Workflow Backend Public API

**Base URL**: `http://localhost:3001/api/v1`

#### 5.2.1 Execute Agent

```http
POST /public/agents/:workflowId/execute
Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
Content-Type: application/json

{
  "csvData": [
    {
      "customerId": "1",
      "name": "Rajesh Kumar",
      "phone": "+919876543210",
      "email": "rajesh@example.com",
      "age": 35,
      "city": "Mumbai",
      "country": "India",
      "occupation": "Software Engineer"
    }
  ],
  "executionInput": {
    "prompt": "Generate a personalized credit card offer",
    "tone": "professional"
  }
}
```

**Response (201)**:
```json
{
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "status": "pending",
  "message": "Execution started successfully"
}
```

#### 5.2.2 Get Execution Status

```http
GET /public/executions/:executionId/status
Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
```

**Response**:
```json
{
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "workflowId": "workflow_bfsi_marketing_template",
  "status": "pending_approval",
  "startedAt": "2025-01-30T10:00:00Z"
}
```

#### 5.2.3 Get Pending Approval Data

```http
GET /public/executions/:executionId/pending-approval
Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
```

**Response**:
```json
{
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "workflowId": "workflow_bfsi_marketing_template",
  "status": "pending_approval",
  "approvalData": {
    "generatedContent": [
      {
        "row": 1,
        "name": "Rajesh Kumar",
        "product": "Premium Credit Card",
        "message": "Dear Rajesh, enjoy 5% cashback on all purchases with our Premium Credit Card. Subject to terms and conditions.",
        "complianceScore": 15,
        "complianceStatus": "pass",
        "violations": [
          {
            "term": "limited time offer",
            "severity": "medium",
            "reason": "Should specify exact dates for promotional offers"
          }
        ],
        "xai": {
          "reasoningTrace": [
            "Analyzed customer profile: Software Engineer, age 35, location Mumbai",
            "Selected credit card product based on occupation",
            "Emphasized cashback benefit as primary value proposition",
            "Added mandatory BFSI disclaimer"
          ],
          "decisionFactors": [
            "Occupation: Software Engineer (high income likelihood)",
            "Age: 35 (prime credit card demographic)",
            "Location: Mumbai (metro city, high spending)"
          ],
          "confidence": 0.92
        },
        "compliance_xai": {
          "ruleHits": [
            {
              "rule": "TRAI DND compliance",
              "severity": "medium",
              "reason": "Marketing message should include opt-out mechanism",
              "evidence": "No 'Reply STOP to unsubscribe' found in message"
            }
          ],
          "scoreBreakdown": {
            "calculation": "1 MEDIUM (15×1) = 15 total risk",
            "violationsBySeverity": {
              "critical": 0,
              "high": 0,
              "medium": 1,
              "low": 0
            }
          },
          "evidence": [
            {
              "text": "enjoy 5% cashback on all purchases"
            }
          ]
        }
      }
    ]
  },
  "startedAt": "2025-01-30T10:00:00Z"
}
```

#### 5.2.4 Approve Content

```http
POST /public/executions/:executionId/approve
Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
Content-Type: application/json

{
  "approvedBy": "user_34CVC4vAJIDZAJQ4N12degrk4P3",
  "comments": "Approved for WhatsApp delivery"
}
```

**Response**:
```json
{
  "status": "approved",
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "message": "Content approved. Workflow will resume."
}
```

#### 5.2.5 Reject Content

```http
POST /public/executions/:executionId/reject
Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
Content-Type: application/json

{
  "rejectedBy": "user_34CVC4vAJIDZAJQ4N12degrk4P3",
  "reason": "Compliance violations need fixing"
}
```

**Response**:
```json
{
  "status": "rejected",
  "executionId": "16cf01cc-e0b6-49a6-bb8e-5b23475a0957",
  "message": "Content rejected. Workflow will regenerate messages."
}
```

---

## 6. Data Flow Diagrams

### 6.1 Campaign Creation Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Upload CSV
     ▼
┌─────────────────────────┐
│  Frontend (Next.js)     │
│  - Validate columns     │
│  - Check max 10 rows    │
│  - Sanitize inputs      │
└────┬────────────────────┘
     │ 2. POST /campaigns/execute
     │    (Clerk JWT in header)
     ▼
┌─────────────────────────┐
│  BFF (Express)          │
│  1. Validate JWT        │
│  2. Extract user context│
│  3. Upsert user         │──────┐
│  4. Check usage limits  │      │
│  5. Increment usage     │◄─────┘
│  6. Proxy to workflow   │
└────┬────────────────────┘
     │ 3. POST /public/agents/{id}/execute
     │    (API Key Bearer token)
     ▼
┌─────────────────────────────────────┐
│  Workflow Backend (NestJS)          │
│  1. Validate API key                │
│  2. Check rate limits               │
│  3. Create execution record         │
│  4. Start workflow engine           │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Workflow Execution                 │
│                                     │
│  ┌──────────────────┐               │
│  │ Trigger Node     │               │
│  │ - Validate input │               │
│  └────┬─────────────┘               │
│       │                             │
│       ▼                             │
│  ┌──────────────────────────┐      │
│  │ AI Content Generator     │      │
│  │ - Call Gemini API        │◄──────── Google Gemini 2.5 Flash
│  │ - Personalize message    │      │
│  │ - Generate XAI           │      │
│  └────┬─────────────────────┘      │
│       │                             │
│       ▼                             │
│  ┌──────────────────────────┐      │
│  │ Compliance Checker       │      │
│  │ - RAG validation         │◄──────── Google Gemini Pro (RAG)
│  │ - Calculate risk score   │      │
│  │ - Generate compliance XAI│      │
│  └────┬─────────────────────┘      │
│       │                             │
│       ▼                             │
│  ┌──────────────────┐               │
│  │ Approval Gate    │               │
│  │ - Pause execution│               │
│  │ - Return results │               │
│  └──────────────────┘               │
└─────────────────────────────────────┘
     │
     │ 4. Return execution ID
     ▼
┌─────────────────────────┐
│  Frontend               │
│  - Redirect to /execution/:id
│  - Poll for results     │
│  - Display messages     │
│  - Show XAI panels      │
└─────────────────────────┘
```

### 6.2 Approval/Rejection Flow

```
┌──────────┐
│  User    │
│  Reviews │
│  Content │
└────┬─────┘
     │
     ├─────── Option A: APPROVE ────────┐
     │                                   │
     │                                   ▼
     │                    ┌───────────────────────────┐
     │                    │ POST /approve             │
     │                    │ - User ID                 │
     │                    │ - Comments (optional)     │
     │                    └────┬──────────────────────┘
     │                         │
     │                         ▼
     │                    ┌───────────────────────────┐
     │                    │ Workflow Resumes          │
     │                    │                           │
     │                    │ ┌─────────────────┐      │
     │                    │ │ WhatsApp Sender │      │
     │                    │ │ - Send messages │◄──────── WhatsApp API
     │                    │ └─────────────────┘      │
     │                    │                           │
     │                    │ Status: COMPLETED         │
     │                    └───────────────────────────┘
     │
     └─────── Option B: REJECT ─────────┐
                                        │
                                        ▼
                         ┌───────────────────────────┐
                         │ POST /reject              │
                         │ - User ID                 │
                         │ - Reason                  │
                         └────┬──────────────────────┘
                              │
                              ▼
                         ┌───────────────────────────┐
                         │ Workflow Rollback         │
                         │                           │
                         │ ┌─────────────────────┐  │
                         │ │ AI Content Generator│  │
                         │ │ - Regenerate with   │◄──── Gemini API
                         │ │   modified params   │  │
                         │ └────┬────────────────┘  │
                         │      │                    │
                         │      ▼                    │
                         │ ┌─────────────────────┐  │
                         │ │ Compliance Checker  │  │
                         │ │ - Re-validate       │◄──── Gemini RAG
                         │ └────┬────────────────┘  │
                         │      │                    │
                         │      ▼                    │
                         │ ┌─────────────────────┐  │
                         │ │ Approval Gate       │  │
                         │ │ - Pause again       │  │
                         │ └─────────────────────┘  │
                         │                           │
                         │ Status: PENDING_APPROVAL  │
                         └───────────────────────────┘
```

### 6.3 Authentication Flow

```
┌──────────┐
│  User    │
│  Visits  │
│  /create │
└────┬─────┘
     │ 1. Check auth status
     ▼
┌─────────────────────────┐
│  Next.js Middleware     │
│  - Check Clerk session  │
└────┬────────────────────┘
     │
     ├─── NOT SIGNED IN ───┐
     │                     │
     │                     ▼
     │          ┌───────────────────┐
     │          │ Redirect to /login│
     │          └───────────────────┘
     │                     │
     │                     ▼
     │          ┌───────────────────┐
     │          │ Clerk Login Page  │
     │          │ - Email/Password  │
     │          │ - Google OAuth    │
     │          └────┬──────────────┘
     │               │ 2. Authenticate
     │               ▼
     │          ┌───────────────────┐
     │          │ Clerk Backend     │
     │          │ - Verify creds    │
     │          │ - Issue JWT       │
     │          └────┬──────────────┘
     │               │ 3. Set session
     └───────────────┘
                     │
     ┌───── SIGNED IN ────┘
     │
     ▼
┌─────────────────────────┐
│  /create Page Loads     │
│  - useAuth() hook       │
│  - getToken() for API   │
└────┬────────────────────┘
     │ 4. API Request
     │    Authorization: Bearer <JWT>
     ▼
┌─────────────────────────┐
│  BFF API                │
│  - @clerk/express       │
│  - requireAuth()        │
│  - getAuth(req)         │
└────┬────────────────────┘
     │ 5. Extract user context
     │    { userId, email, name }
     ▼
┌─────────────────────────┐
│  Process Request        │
│  - Upsert user in DB    │
│  - Track usage          │
│  - Return response      │
└─────────────────────────┘
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**Frontend → BFF**: Clerk JWT
- User signs in via Clerk (email/password or OAuth)
- Clerk issues JWT token with user claims
- Frontend includes JWT in `Authorization: Bearer <token>` header
- BFF validates JWT using `@clerk/express` middleware
- User context extracted: `userId`, `email`, `name`

**BFF → Workflow Backend**: API Key
- BFF uses hardcoded API key: `wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw`
- API key stored in environment variable `WORKFLOW_API_KEY`
- Workflow backend validates API key using `ApiKeyGuard`
- API key hashed with SHA-256 in database
- Rate limiting enforced per API key (10 req/burst, 60 req/min)

### 7.2 Input Validation & Sanitization

**Frontend**:
- CSV column validation (required fields)
- Row count validation (max 10 rows)
- XSS sanitization using `isomorphic-dompurify`
- Form validation (prompt required, non-empty)

**BFF**:
- Zod schema validation for request bodies
- Clerk JWT validation
- SQL parameterized queries (prevents SQL injection)

**Workflow Backend**:
- DTO validation using `class-validator`
- API key hash comparison (constant-time to prevent timing attacks)
- CSV row truncation (max 100 rows, automatic)
- Node configuration validation

### 7.3 Data Protection

**In Transit**:
- HTTPS enforced in production (TLS 1.3)
- Clerk JWT tokens signed and encrypted
- API keys transmitted via Bearer token (encrypted in transit)

**At Rest**:
- API keys hashed with SHA-256 (never stored in plaintext)
- User passwords managed by Clerk (bcrypt hashing)
- Database credentials stored in environment variables
- PII (name, email, phone) stored in database (should be encrypted in production)

**Secrets Management**:
- `.env` files for local development (not committed to git)
- Production: Environment variables via hosting provider
- API keys rotatable via `/regenerate` endpoint

### 7.4 Rate Limiting

**BFF**: (Not currently implemented, should be added)
- Recommended: 100 requests/minute per user
- Use `express-rate-limit` middleware

**Workflow Backend**:
- Token bucket algorithm (implemented)
- 10 requests/burst, 60 requests/minute per API key
- Returns 429 Too Many Requests when exceeded

### 7.5 CORS Policy

**BFF**:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

**Workflow Backend**:
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: 'GET,POST,PATCH,DELETE',
  credentials: true
});
```

### 7.6 Audit Trail

**Compliance Audit Logs**:
- Stored in `audit_logs` table
- Captures: userId, action, resource, details, timestamp
- Example actions:
  - `compliance_check_passed`
  - `compliance_check_failed`
  - `campaign_approved`
  - `campaign_rejected`

**Usage Tracking**:
- Every campaign execution tracked in `usage_stats`
- Incremented atomically with SQL upsert
- Monthly reset (period_start, period_end)

---

## 8. Deployment Architecture

### 8.1 Production Infrastructure (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Next.js App (Edge Functions)                      │     │
│  │  - CDN distribution                                │     │
│  │  - Automatic HTTPS                                 │     │
│  │  - Environment variables for Clerk + BFF URL       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      RAILWAY/RENDER (BFF)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Express.js App (Container)                        │     │
│  │  - Auto-scaling (1-3 instances)                    │     │
│  │  - Health checks                                   │     │
│  │  - Environment variables (Clerk, DB, Workflow)     │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
│                            │ PostgreSQL Connection           │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  PostgreSQL Database (Managed)                     │     │
│  │  - users table                                     │     │
│  │  - usage_stats table                               │     │
│  │  - Automated backups                               │     │
│  │  - Connection pooling                              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (API Key)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY/RENDER (Workflow Backend)               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  NestJS App (Container)                            │     │
│  │  - Auto-scaling (2-5 instances)                    │     │
│  │  - WebSocket support                               │     │
│  │  - Environment variables (Gemini API, DB)          │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
│                            │ Prisma Connection               │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  PostgreSQL Database (Managed)                     │     │
│  │  - Workflow tables                                 │     │
│  │  - Execution logs                                  │     │
│  │  - Audit logs                                      │     │
│  │  - Automated backups                               │     │
│  │  - Point-in-time recovery                          │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Environment Variables

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_BFF_API_URL=https://bff.production.com
```

**BFF (.env)**:
```bash
PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db.railway.app:5432/bfsi_campaigns
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
WORKFLOW_API_URL=https://workflow.production.com/api/v1
WORKFLOW_API_KEY=wf_...
```

**Workflow Backend (.env)**:
```bash
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db.railway.app:5432/workflow
GOOGLE_AI_API_KEY=AIzaSy...
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_TOKEN=...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 8.3 CI/CD Pipeline (Recommended)

**GitHub Actions Workflow**:
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/vercel-action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-bff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-workflow:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: pnpm test
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_WORKFLOW_TOKEN }}
```

---

## 9. Development Setup

### 9.1 Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+
- PostgreSQL 15+
- Git
- Clerk account (free tier)
- Google AI API key (Gemini)

### 9.2 Local Setup

**1. Clone Repository**:
```bash
git clone <repository-url>
cd bfsi-campaign-generator
```

**2. Install Dependencies**:
```bash
pnpm install
```

**3. Setup BFF Database**:
```bash
# Create PostgreSQL database
createdb bfsi_campaigns

# Create tables
psql -d bfsi_campaigns -f apps/bff/schema.sql
```

**4. Setup Workflow Database**:
```bash
cd /path/to/workflow-automation-mvp
pnpm --filter @workflow/backend prisma:generate
pnpm --filter @workflow/backend prisma:migrate
pnpm --filter @workflow/backend prisma:seed
```

**5. Configure Environment Variables**:

Create `apps/bff/.env`:
```bash
PORT=5001
DATABASE_URL=postgresql://bfsi_user:password@localhost:5432/bfsi_campaigns
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WORKFLOW_API_URL=http://localhost:3001/api/v1
WORKFLOW_API_KEY=wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw
```

Create `.env.local` (frontend):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BFF_API_URL=http://localhost:5001
```

Workflow backend `.env` (in workflow-automation-mvp):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/workflow
GOOGLE_AI_API_KEY=AIzaSy...
CLERK_SECRET_KEY=sk_test_...
```

**6. Start Development Servers**:

Terminal 1 - Workflow Backend:
```bash
cd /path/to/workflow-automation-mvp
pnpm dev
```

Terminal 2 - BFF:
```bash
cd apps/bff
npx tsx src/server.ts
```

Terminal 3 - Frontend:
```bash
pnpm dev:frontend
```

**7. Verify Services**:
- Frontend: http://localhost:3000
- BFF: http://localhost:5001/health
- Workflow: http://localhost:3001/api/v1/health

### 9.3 Database Management

**View BFF Database**:
```bash
psql -d bfsi_campaigns

# Useful queries:
SELECT * FROM users;
SELECT * FROM usage_stats;
```

**View Workflow Database** (Prisma Studio):
```bash
cd /path/to/workflow-automation-mvp
pnpm --filter @workflow/backend prisma:studio
```

Open http://localhost:5555

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Frontend (Jest + React Testing Library)**:
```bash
pnpm test
```

Test coverage:
- Components: CSV upload, column preview
- Utilities: Sanitization functions
- API clients: BFF API, mock responses

**Backend (Jest + Supertest)**:
```bash
# BFF
cd apps/bff
pnpm test

# Workflow
cd /path/to/workflow-automation-mvp
pnpm --filter @workflow/backend test
```

Test coverage:
- Services: User service, compliance RAG
- Controllers: Route handlers, error cases
- Executors: Node execution logic

### 10.2 Integration Tests

**End-to-End Campaign Creation**:
```bash
# Test script
./test-campaign.sh
```

Verifies:
1. CSV upload and validation
2. Usage limit enforcement
3. Campaign creation (BFF → Workflow)
4. Workflow execution (AI + Compliance)
5. Approval/rejection flow
6. Database state changes

**Test Cases**:
- ✅ Valid campaign with compliant content
- ✅ Campaign with compliance violations
- ✅ Row limit exceeded (>10 rows)
- ✅ Campaign limit exceeded (≥100 campaigns)
- ✅ Invalid CSV columns
- ✅ Unauthenticated request (no JWT)
- ✅ Invalid API key (workflow backend)

### 10.3 Manual Testing Checklist

**Authentication**:
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Redirect to /login when unauthenticated

**Campaign Creation**:
- [ ] Upload valid CSV (10 rows)
- [ ] Upload invalid CSV (missing columns)
- [ ] Upload too many rows (>10)
- [ ] Submit without CSV
- [ ] Submit without prompt
- [ ] Successfully create campaign
- [ ] View usage stats increment

**Execution Monitoring**:
- [ ] View execution in progress
- [ ] See generated messages
- [ ] View compliance scores
- [ ] Expand XAI explanations
- [ ] Approve campaign
- [ ] Reject campaign
- [ ] View updated execution status

**Limit Enforcement**:
- [ ] Warning shown at 80% usage
- [ ] Campaign blocked at 100 campaigns
- [ ] Row limit enforced in BFF
- [ ] Dialog shown on limit exceeded

### 10.4 Performance Testing

**Load Testing (Artillery)**:
```bash
artillery quick --count 10 --num 50 http://localhost:5001/health
```

Targets:
- BFF: 100 req/s sustained
- Workflow: 50 req/s sustained (limited by Gemini API)
- Database: <100ms query latency

**Stress Testing**:
- 100 concurrent users creating campaigns
- 1000 CSV rows processed in parallel
- API rate limit validation (429 errors)

---

## 11. Code Patterns & Conventions

### 11.1 TypeScript Conventions

**Naming**:
- Interfaces: PascalCase (`UsageStats`, `CsvRow`)
- Types: PascalCase (`ExecutionStatus`, `PlanType`)
- Functions: camelCase (`getUsage`, `startCampaign`)
- Constants: UPPER_SNAKE_CASE (`MAX_CAMPAIGNS`, `WORKFLOW_ID`)
- Database columns: snake_case (`campaigns_generated`, `user_id`)
- TypeScript properties: camelCase (`campaignsGenerated`, `userId`)

**Type Safety**:
- Strict mode enabled (`strict: true`)
- No `any` types (use `unknown` instead)
- Zod schemas for runtime validation
- Prisma types for database models

### 11.2 Error Handling

**Frontend**:
```typescript
try {
  const response = await bffApi.startCampaign(data, token);
  router.push(`/execution/${response.executionId}`);
} catch (error) {
  const errorMessage = error instanceof Error
    ? error.message
    : 'Failed to start campaign. Please try again.';
  alert(errorMessage);
}
```

**BFF**:
```typescript
router.post('/campaigns/execute', async (req, res, next) => {
  try {
    // Validation
    const parsed = executionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid payload',
        details: parsed.error.flatten()
      });
    }

    // Business logic...
  } catch (err) {
    next(err); // Pass to error middleware
  }
});
```

**Workflow Backend**:
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof Error ? exception.message : 'Internal server error'
    });
  }
}
```

### 11.3 Database Queries

**Parameterized Queries** (BFF):
```typescript
// ✅ CORRECT (prevents SQL injection)
await pool.query(
  'SELECT * FROM users WHERE user_id = $1',
  [userId]
);

// ❌ WRONG (vulnerable to SQL injection)
await pool.query(
  `SELECT * FROM users WHERE user_id = '${userId}'`
);
```

**Atomic Upserts** (BFF):
```typescript
await pool.query(
  `INSERT INTO usage_stats (user_id, campaigns_generated, rows_processed)
   VALUES ($1, $2, $3)
   ON CONFLICT (user_id) DO UPDATE
   SET campaigns_generated = usage_stats.campaigns_generated + $2,
       rows_processed = usage_stats.rows_processed + $3,
       updated_at = now()`,
  [userId, campaigns, rows]
);
```

**Prisma Queries** (Workflow):
```typescript
// Include related data
const execution = await prisma.workflowExecution.findUnique({
  where: { id: executionId },
  include: {
    nodeExecutions: true,
    workflow: true
  }
});

// Transaction for atomic operations
await prisma.$transaction([
  prisma.workflowExecution.update({
    where: { id: executionId },
    data: { status: 'running' }
  }),
  prisma.nodeExecution.create({
    data: {
      executionId,
      nodeId: 'node_1',
      status: 'running'
    }
  })
]);
```

### 11.4 API Response Formats

**Success Response**:
```json
{
  "executionId": "uuid",
  "status": "pending",
  "message": "Execution started successfully"
}
```

**Error Response**:
```json
{
  "error": "Campaign limit reached",
  "message": "You have reached your free tier limit of 100 campaigns",
  "limit": 100,
  "current": 100
}
```

**Validation Error**:
```json
{
  "error": "Invalid payload",
  "details": {
    "fieldErrors": {
      "prompt": ["Required"],
      "csvData": ["Expected array, received null"]
    }
  }
}
```

---

## 12. Integration Points

### 12.1 Google Gemini API

**Content Generation** (Gemini 2.5 Flash):
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    maxOutputTokens: 4000,
    temperature: 0.7
  }
});

const prompt = `Generate a personalized marketing message...`;
const result = await model.generateContent(prompt);
const message = result.response.text();
```

**Compliance RAG** (Gemini Pro):
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-pro',
  generationConfig: {
    maxOutputTokens: 8000,
    temperature: 0.2 // Lower for more deterministic compliance checking
  }
});

const ragPrompt = `
${COMPLIANCE_KNOWLEDGE_BASE}

Content to check: "${content}"

Provide compliance verdict in JSON format...
`;

const result = await model.generateContent(ragPrompt);
const complianceResult = JSON.parse(result.response.text());
```

**Rate Limits & Quotas**:
- Free tier: 60 requests/minute
- Error handling: 429 quota exceeded → return cached/default result

### 12.2 Clerk Authentication

**Frontend Hooks**:
```typescript
import { useUser, useAuth } from '@clerk/nextjs';

const { user, isSignedIn, isLoaded } = useUser();
const { getToken } = useAuth();

const token = await getToken();
// Use token in API calls
```

**Backend Validation**:
```typescript
import { requireAuth, getAuth } from '@clerk/express';

router.use(requireAuth()); // All routes require auth

router.get('/me', (req, res) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  const sessionClaims = auth.sessionClaims;
});
```

**Session Claims**:
```json
{
  "userId": "user_34CVC4vAJIDZAJQ4N12degrk4P3",
  "email": "cvishnuu01@gmail.com",
  "name": "Vishnu C",
  "email_addresses": ["cvishnuu01@gmail.com"],
  "iat": 1706601234,
  "exp": 1706604834
}
```

### 12.3 WhatsApp Business API

**Send Message**:
```typescript
const response = await axios.post(
  `${WHATSAPP_API_URL}/messages`,
  {
    messaging_product: 'whatsapp',
    to: customerPhone,
    type: 'text',
    text: {
      body: message
    }
  },
  {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);
```

**Webhook for Delivery Status**:
```typescript
@Post('/whatsapp/webhook')
handleWebhook(@Body() body: any) {
  const messageStatus = body.entry[0].changes[0].value.statuses[0];
  // Update delivery status in database
}
```

---

## 13. Troubleshooting Guide

### 13.1 Common Issues

#### Issue: Campaign count not incrementing

**Symptoms**:
- Usage stats show 0 campaigns after creating campaigns
- Database `usage_stats` table not updating

**Root Cause**:
- Frontend bypassing BFF and calling workflow backend directly
- BFF returning mock response instead of proxying
- SQL UPDATE failing silently (user row doesn't exist)

**Solution**:
1. Ensure frontend calls `bffApi.startCampaign()` NOT `campaignApi.startCampaign()`
2. Verify BFF proxies to workflow backend (check axios call in `/campaigns/execute` route)
3. Ensure `upsertUser()` called before `incrementUsage()` (line 82 in `apps/bff/src/routes/index.ts`)

#### Issue: Foreign key constraint violation

**Error**:
```
error: insert or update on table "usage_stats" violates foreign key constraint "usage_stats_user_id_fkey"
detail: Key (user_id)=(user_35ujhBrdlCbnnAHVxJaXoO7g9lO) is not present in table "users".
```

**Root Cause**:
- `incrementUsage()` tries to insert into `usage_stats` before user exists in `users` table

**Solution**:
Add `await upsertUser(...)` before `getUsage()` in `/campaigns/execute` route:
```typescript
await upsertUser(userContext.userId, userContext.email, userContext.name);
const usage = await getUsage(userContext.userId);
```

#### Issue: TypeScript build errors (property name mismatch)

**Error**:
```
Property 'campaigns_generated' does not exist on type 'UsageRecord'. Did you mean 'campaignsGenerated'?
```

**Root Cause**:
- TypeScript interface uses camelCase but code uses snake_case

**Solution**:
Use camelCase property names to match TypeScript types:
```typescript
// ✅ CORRECT
if (usage.campaignsGenerated >= MAX_CAMPAIGNS) {

// ❌ WRONG
if (usage.campaigns_generated >= MAX_CAMPAIGNS) {
```

#### Issue: Gemini API 429 quota exceeded

**Error**:
```
Gemini API error (429): You exceeded your current quota
```

**Root Cause**:
- Free tier rate limit exceeded (60 req/min)

**Solution**:
1. Wait for quota reset (refreshes every minute)
2. Upgrade to paid tier for higher limits
3. Implement caching for repeated requests
4. Add exponential backoff retry logic

#### Issue: XAI explanations not showing

**Symptoms**:
- `xai` field is null in execution results
- Compliance XAI missing `scoreBreakdown`

**Root Cause**:
- AI executor not generating XAI metadata
- Compliance executor not calling enhanced XAI generation

**Solution**:
1. Verify `AIContentGeneratorExecutor` includes XAI generation (line 180+)
2. Verify `ComplianceCheckerExecutor` generates `scoreBreakdown` (line 220+)
3. Check `node_executions.metadata` column in database

#### Issue: CSV upload fails validation

**Error**:
```
Missing required columns: customer_id, occupation
```

**Root Cause**:
- CSV has different column names than expected

**Solution**:
Required columns (case-insensitive):
- `customer_id`
- `name`
- `age`
- `phone`
- `email`
- `occupation`

Update CSV header row to match exactly.

### 13.2 Debugging Tips

**Enable Verbose Logging (BFF)**:
```typescript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
```

**Check Database State (BFF)**:
```bash
psql -d bfsi_campaigns
SELECT * FROM users WHERE user_id = 'user_...';
SELECT * FROM usage_stats WHERE user_id = 'user_...';
```

**Check Workflow Execution (Prisma Studio)**:
```bash
cd /path/to/workflow-automation-mvp
pnpm --filter @workflow/backend prisma:studio
```
Navigate to:
- `WorkflowExecution` → Find execution ID
- `NodeExecution` → View individual node results and metadata

**Test BFF Endpoint (curl)**:
```bash
# Get Clerk token from browser DevTools (Application → Cookies → __session)
TOKEN="your_jwt_token"

curl -X POST http://localhost:5001/campaigns/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": [...],
    "prompt": "Test campaign",
    "tone": "professional"
  }'
```

**Test Workflow Endpoint (curl)**:
```bash
curl -X POST http://localhost:3001/api/v1/public/agents/workflow_bfsi_marketing_template/execute \
  -H "Authorization: Bearer wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw" \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": [...],
    "executionInput": {
      "prompt": "Test",
      "tone": "professional"
    }
  }'
```

### 13.3 Logs & Monitoring

**BFF Logs**:
```bash
# Start with logging
cd apps/bff
npx tsx src/server.ts | tee bff.log
```

**Workflow Logs**:
```bash
cd /path/to/workflow-automation-mvp
pnpm dev | tee workflow.log
```

**Database Query Logs** (PostgreSQL):
```bash
# Edit postgresql.conf
log_statement = 'all'
log_duration = on

# Restart PostgreSQL
sudo systemctl restart postgresql

# Tail logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

**Production Monitoring** (Recommended):
- **Application**: Sentry (error tracking), LogRocket (session replay)
- **Infrastructure**: Railway/Render built-in metrics
- **Database**: pgAnalyze (query performance), PgHero
- **API**: Postman Monitoring, Uptime Robot

---

## Appendix A: Database ERD

### BFF Database

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ user_id (PK)        │◄───┐
│ email (UNIQUE)      │    │
│ name                │    │
│ created_at          │    │
│ updated_at          │    │
└─────────────────────┘    │
                           │
                           │ FK
                           │
┌─────────────────────┐    │
│   usage_stats       │    │
├─────────────────────┤    │
│ user_id (PK, FK)    │────┘
│ campaigns_generated │
│ rows_processed      │
│ period_start        │
│ period_end          │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Workflow Database

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │◄───────┐
│ clerkId (UNIQUE)    │        │
│ email (UNIQUE)      │        │
│ name                │        │
└─────────────────────┘        │
         │                     │
         │ 1:N                 │
         ▼                     │
┌─────────────────────┐        │
│     Workflow        │        │
├─────────────────────┤        │
│ id (PK)             │◄───┐   │
│ name                │    │   │
│ definition (JSON)   │    │   │
│ createdBy (FK)      │────┘   │
└─────────────────────┘        │
         │                     │
         │ 1:N                 │
         ▼                     │
┌──────────────────────────┐   │
│  WorkflowExecution       │   │
├──────────────────────────┤   │
│ id (PK)                  │◄──┐
│ workflowId (FK)          │   │
│ status                   │   │
│ input (JSON)             │   │
│ output (JSON)            │   │
│ startedAt                │   │
│ completedAt              │   │
└──────────────────────────┘   │
         │                     │
         │ 1:N                 │
         ▼                     │
┌──────────────────────────┐   │
│   NodeExecution          │   │
├──────────────────────────┤   │
│ id (PK)                  │   │
│ executionId (FK)         │───┘
│ nodeId                   │
│ nodeType                 │
│ input (JSON)             │
│ output (JSON)            │
│ metadata (JSON)          │ ← XAI data stored here
│ status                   │
│ startedAt                │
│ completedAt              │
└──────────────────────────┘

┌─────────────────────┐
│      ApiKey         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ keyHash (UNIQUE)    │
│ userId (FK)         │──────┐
│ status              │      │
│ usageCount          │      │
│ usageLimit          │      │
│ webhookUrl          │      │
│ webhookSecret       │      │
│ createdAt           │      │
│ revokedAt           │      │
└─────────────────────┘      │
                             │ FK
                             │
┌─────────────────────┐      │
│     AuditLog        │      │
├─────────────────────┤      │
│ id (PK)             │      │
│ userId (FK)         │──────┘
│ action              │
│ resource            │
│ details (JSON)      │
│ timestamp           │
└─────────────────────┘
```

---

## Appendix B: Glossary

**API Key**: Cryptographic token used to authenticate requests to the workflow backend public API. Hashed with SHA-256 before storage.

**BFF (Backend for Frontend)**: Intermediate server layer between frontend and workflow backend. Handles authentication, usage tracking, and request proxying.

**Campaign**: A marketing outreach initiative involving personalized message generation for multiple customers.

**Compliance Score**: Numeric risk assessment (0-100) calculated by summing severity-weighted violations. 0 = pass, 100 = fail.

**CSV Row**: Single customer record with required fields: customer_id, name, phone, email, age, location, occupation.

**Dual XAI**: Two-layer explainability system providing reasoning for both content generation and compliance checking.

**Execution**: Single run of a workflow, processing one batch of CSV rows through all nodes.

**Node**: Atomic unit of workflow logic (e.g., AI generator, compliance checker, WhatsApp sender).

**RAG (Retrieval-Augmented Generation)**: AI technique where knowledge base is injected into prompts to ground responses in factual data.

**Severity Weights**: Compliance violation scoring: CRITICAL=40, HIGH=25, MEDIUM=15, LOW=5.

**Usage Stats**: Monthly tracking of campaigns generated and rows processed per user.

**Workflow**: Directed graph of nodes defining campaign execution logic (trigger → AI → compliance → approval → WhatsApp).

**XAI (Explainable AI)**: Metadata explaining AI decisions, including reasoning traces, decision factors, and confidence scores.

---

**End of Technical Documentation**
