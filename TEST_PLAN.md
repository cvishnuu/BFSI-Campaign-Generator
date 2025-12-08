# BFSI Campaign Generator - Test Plan

## 1. Campaign Flow Testing

### Test 1.1: Normal Flow (Under Limit)
**Precondition:** User has < 100 campaigns
**Steps:**
1. Navigate to `/create`
2. Upload CSV with 5 rows
3. Enter campaign prompt
4. Click "Start Campaign"
5. Observe network requests in DevTools

**Expected Result:**
- First request: `POST /api/v1/campaigns/validate-and-track` (BFF) - Status 200
- Second request: `POST /api/v1/public/agents/workflow_bfsi_marketing_template/execute` (Workflow API) - Status 201
- Redirects to `/execution/:id`

---

### Test 1.2: Campaign Limit Reached
**Precondition:** User has 100 campaigns
**Steps:**
1. Navigate to `/create`
2. Upload CSV with 5 rows
3. Enter campaign prompt
4. Click "Start Campaign"

**Expected Result:**
- Request: `POST /api/v1/campaigns/validate-and-track` (BFF) - Status 403
- Error dialog appears: "You have reached your free tier limit of 100 campaigns"
- NO request to workflow API (verify in Network tab)
- Usage count stays at 100 (check BFF database)

---

### Test 1.3: Row Limit Exceeded
**Precondition:** User has 0 campaigns
**Steps:**
1. Navigate to `/create`
2. Upload CSV with 11 rows
3. Enter campaign prompt
4. Click "Start Campaign"

**Expected Result:**
- Request: `POST /api/v1/campaigns/validate-and-track` (BFF) - Status 400
- Error message: "Maximum 10 rows allowed per campaign"
- NO request to workflow API

---

## 2. XAI Explanation Testing

### Test 2.1: Compliance Score Breakdown (No Violations)
**Steps:**
1. Create campaign with compliant content
2. Navigate to `/review/:executionId`
3. Click "View" on any message
4. Go to "Compliance Check" tab

**Expected Result:**
- Score breakdown card visible
- Formula displayed: "Compliance % = 100 - Risk Score"
- Risk formula: "Risk Score = (CRITICAL × 40) + (HIGH × 25) + (MEDIUM × 15) + (LOW × 5)"
- Calculation: "0 violations = 0 total risk → 100% compliance"
- Violations by severity: 0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW
- Each shows "-0 pts"

---

### Test 2.2: Compliance Score Breakdown (With Violations)
**Steps:**
1. Create campaign with content containing violations
2. Navigate to `/review/:executionId`
3. Click "View" on a message with violations
4. Go to "Compliance Check" tab

**Expected Result:**
- Score breakdown shows actual violations
- Example: "2 MEDIUM (15×2) = 30 total risk → 70% compliance"
- Rule hits show point deductions: "-15 points" badge next to MEDIUM severity
- Violations by severity section shows counts with colored point deductions

---

## 3. Color Scheme Testing

### Test 3.1: Create Page Colors
**Steps:**
1. Navigate to `/create`
2. Visually inspect all elements

**Expected Result:**
- Step number badges (1 and 2) are orange (#FA7315)
- "Ready to Generate?" card has orange border and background
- "View Plans" button in limit dialog is orange
- NO blue colors visible (except green/red/yellow for success/error/warning)

---

### Test 3.2: Review Page Colors
**Steps:**
1. Navigate to `/review/:executionId`

**Expected Result:**
- Loading spinner is orange
- "Ready to Finalize?" card has orange border and background
- NO blue colors in workflow cards

---

## 4. XSS Sanitization Testing

### Test 4.1: Contact Form XSS
**Steps:**
1. Navigate to `/contact`
2. Enter XSS payload in each field:
   - Name: `<script>alert('XSS1')</script>John`
   - Email: `test@example.com<img src=x onerror=alert('XSS2')>`
   - Company: `<b onclick="alert('XSS3')">Evil Corp</b>`
   - Message: `Hello <iframe src="javascript:alert('XSS4')"></iframe>`
3. Check form state in React DevTools
4. Submit form

**Expected Result:**
- All HTML tags stripped in form state
- Name shows: "John"
- Email shows: "test@example.comx"
- Company shows: "Evil Corp"
- Message shows: "Hello "
- NO alerts triggered
- NO script execution in console

---

### Test 4.2: Review Page XSS (Reject Reason)
**Steps:**
1. Navigate to `/review/:executionId`
2. Click "Reject" on any message
3. Enter XSS in rejection reason:
   `Message is bad <script>alert('XSS5')</script>`
4. Check textarea value in DevTools
5. Click "Regenerate"

**Expected Result:**
- Textarea shows: "Message is bad "
- NO alert triggered
- API receives sanitized text

---

### Test 4.3: Review Page XSS (Edit Message)
**Steps:**
1. Navigate to `/review/:executionId`
2. Click "View" on any message
3. Click "Edit"
4. Modify message with XSS:
   `Dear customer, <script>alert('XSS6')</script> enjoy`
5. Click "Save"

**Expected Result:**
- Textarea shows: "Dear customer,  enjoy"
- NO alert triggered
- Saved message is sanitized

---

### Test 4.4: CSV Upload XSS
**Steps:**
1. Create CSV file with XSS payloads:
   ```csv
   customerId,name,phone,email,age,city,country,occupation
   1,"<script>alert('XSS7')</script>John",+919876543210,test@test.com,30,Delhi,India,Engineer
   2,"Jane<img src=x onerror=alert('XSS8')>",+919876543211,jane@test.com,25,Mumbai,India,Doctor
   ```
2. Upload CSV in `/create`
3. Check preview table
4. Submit campaign
5. Check execution results

**Expected Result:**
- Preview shows: "John" and "Jane" (tags stripped)
- NO alerts triggered during upload
- Generated content contains sanitized names
- Database stores sanitized values

---

## 5. Integration Testing

### Test 5.1: End-to-End Campaign Creation
**Steps:**
1. Start with user at 99 campaigns
2. Upload valid CSV (5 rows)
3. Enter prompt: "Generate credit card offer"
4. Submit campaign
5. Wait for execution to complete
6. Review content
7. Approve campaign
8. Download results

**Expected Result:**
- Usage increments from 99 to 100 after validation
- Workflow executes successfully
- Content shows XAI explanations with score breakdown
- Compliance XAI shows formula and point deductions
- Orange branding throughout
- All displayed content is sanitized

---

### Test 5.2: Workflow Failure (Usage Still Tracked)
**Steps:**
1. Manually stop workflow backend
2. Upload CSV and submit campaign
3. Check BFF database usage count

**Expected Result:**
- `validate-and-track` succeeds (200)
- Usage count incremented
- Workflow API call fails (connection error)
- Error shown to user
- Usage count remains incremented (not rolled back)

---

## 6. Database Verification

### Test 6.1: Usage Tracking
**SQL Query:**
```sql
SELECT user_id, campaigns_generated, rows_processed, period_start
FROM usage_stats
WHERE user_id = 'clerk_user_id';
```

**Expected Result:**
- `campaigns_generated` increments on each campaign
- `rows_processed` increments by CSV row count
- `period_start` matches current billing cycle

---

## 7. Security Testing

### Test 7.1: API Key Security
**Steps:**
1. Open browser DevTools → Network tab
2. Submit campaign
3. Inspect `POST /public/agents/.../execute` request headers

**Expected Result:**
- Authorization header contains workflow API key
- Key starts with "wf_" (workflow API key format)
- NOT Clerk JWT token

---

### Test 7.2: XSS Prevention in API Response
**Steps:**
1. Manually inject XSS into database (via SQL):
   ```sql
   UPDATE workflow_executions
   SET output = '{"message": "<script>alert(123)</script>"}'
   WHERE id = 'test_execution_id';
   ```
2. Navigate to `/review/:executionId`
3. Check if script executes

**Expected Result:**
- Content displayed as text
- NO script execution
- Browser escapes HTML entities

---

## 8. Browser Compatibility

### Test 8.1: Cross-Browser Testing
**Browsers:** Chrome, Firefox, Safari, Edge
**Steps:**
1. Test all workflows
2. Test XAI panels
3. Test color rendering

**Expected Result:**
- Consistent behavior across browsers
- Orange color renders correctly (#FA7315)
- No layout issues

---

## 9. Performance Testing

### Test 9.1: Large CSV Upload
**Steps:**
1. Create CSV with 10 rows (max limit)
2. Upload and measure time
3. Check memory usage

**Expected Result:**
- Upload completes in < 3 seconds
- No memory leaks
- Smooth UI rendering

---

## 10. Rollback Testing

### Test 10.1: Revert to Old Flow
**Steps:**
1. Change frontend to call old `bffApi.startCampaign()` endpoint
2. Submit campaign
3. Verify it still works

**Expected Result:**
- Old endpoint still functional (backward compatibility)
- Usage tracked correctly
- Workflow executes

---

## Test Execution Checklist

- [ ] Test 1.1: Normal flow under limit
- [ ] Test 1.2: Campaign limit reached
- [ ] Test 1.3: Row limit exceeded
- [ ] Test 2.1: Compliance score (no violations)
- [ ] Test 2.2: Compliance score (with violations)
- [ ] Test 3.1: Create page colors
- [ ] Test 3.2: Review page colors
- [ ] Test 4.1: Contact form XSS
- [ ] Test 4.2: Review reject XSS
- [ ] Test 4.3: Review edit XSS
- [ ] Test 4.4: CSV upload XSS
- [ ] Test 5.1: End-to-end campaign
- [ ] Test 5.2: Workflow failure scenario
- [ ] Test 6.1: Database usage verification
- [ ] Test 7.1: API key security
- [ ] Test 7.2: XSS prevention in API
- [ ] Test 8.1: Cross-browser testing
- [ ] Test 9.1: Large CSV performance
- [ ] Test 10.1: Rollback test

---

## Bug Tracking Template

**Bug ID:** BUG-001
**Severity:** Critical / High / Medium / Low
**Component:** Campaign Flow / XAI / Colors / Sanitization
**Description:**
**Steps to Reproduce:**
**Expected Result:**
**Actual Result:**
**Screenshots:**
**Fix Status:**
