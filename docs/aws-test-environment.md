# AWS Test Environment Setup (Budget-Friendly)

This guide designs a **shared test backend** for the Kwoka Fitness **mobile app** and **landing site**. Both clients already speak the same concepts in [`api-contract.md`](./api-contract.md); this document turns that contract into a cheap AWS stack, Postgres schemas, and S3 layout.

**Goal:** one source of truth so a booking, workout, message, or order created on the landing appears correctly in the mobile app (and vice versa).

**Non-goals:** production HA, multi-region, real payment capture, CloudFront CDN, WAF, or ECS. Those can come later.

---

## 1. Architecture overview

```text
┌─────────────────┐     ┌─────────────────┐
│  Landing (Vite) │     │ Mobile (Expo)   │
│  GitHub Pages   │     │ Native / Web    │
└────────┬────────┘     └────────┬────────┘
         │  HTTPS + JWT          │
         └──────────┬────────────┘
                    ▼
         ┌──────────────────────┐
         │ API Gateway HTTP API │
         │ + Lambda (Node 20)   │
         └──────────┬───────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌────────────┐
│ Cognito │   │ RDS      │   │ S3 media   │
│ User    │   │ Postgres │   │ + signed   │
│ Pool    │   │ t4g.micro│   │ URLs       │
└─────────┘   └──────────┘   └────────────┘
                    │
                    ▼
              ┌──────────┐
              │ SES      │  (sandbox: contact / newsletter)
              └──────────┘
```

### Why this stack (budget)

| Concern | Choice | Why (test cost) |
|--------|--------|------------------|
| Auth | Cognito User Pool | Free tier (~50k MAU); shared identity for web + mobile |
| API | HTTP API + Lambda | Pay-per-request; near $0 at demo traffic |
| Data | RDS PostgreSQL `db.t4g.micro`, single-AZ, 20 GB gp3 | Relational fit for workouts/bookings/credits; ~$12–15/mo |
| Media | One S3 bucket, signed URLs, no CloudFront | Storage pennies; avoid CDN until needed |
| Email | SES sandbox | Free; verify recipient emails in sandbox |
| Secrets | SSM Parameter Store (Standard) | Free tier enough for test |
| Messaging | Rows in Postgres + client poll / soft refresh | No AppSync/SQS until real-time is required |
| Hosting frontends | Keep GitHub Pages | Already free; only point `EXPO_PUBLIC_API_URL` / `VITE_API_URL` at the HTTP API |

**Estimated steady cost for a quiet test env:** roughly **$15–25/month** after free-tier credits, dominated by the RDS instance. Tear down RDS when unused to drop to near zero.

### Cheaper alternative (optional)

If you want **under ~$10/mo**, run a single **Lightsail** `$5–7` instance with Docker Compose (`api` + `postgres`) and keep only S3 + Cognito + SES on AWS. Schemas below still apply; only networking/deploy changes.

---

## 2. Shared-data rules (mobile ↔ landing)

1. **One database, one API.** No separate “landing DB” and “mobile DB.”
2. **Identity is Cognito `sub`**, stored on `users.cognito_sub`. Roles live in Cognito custom attributes **and** `users.role` (API trusts Cognito claims, not the client body).
3. **Trainer–client assignment** gates messages, progress, workouts, and bookings.
4. **Appointments = bookings.** Landing `pending|confirmed|cancelled` maps to `appointments.status`. Mobile `scheduled` ≡ `confirmed`.
5. **Session credits** are granted only by order/webhook handlers, never by the UI.
6. **Media** is never uploaded through the API body; clients use `POST /media/upload-intents`, then PUT to S3.
7. Carts may stay client-side for the test env; **orders** are server-side.

Wire both apps with the same base URL:

```bash
# landing
VITE_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com

# mobile
EXPO_PUBLIC_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com
```

---

## 3. AWS resources to create (checklist)

Use **one region** (recommend `us-east-1`). Tag everything `Project=kwoka`, `Env=test`.

### 3.1 Cognito

1. Create **User Pool** `kwoka-test`.
2. App clients:
   - `kwoka-landing` (public client, auth code + optional password for demo)
   - `kwoka-mobile` (public client, USER_PASSWORD_AUTH and/or hosted UI as needed)
3. Custom attributes (or use `custom:role`):
   - `role` ∈ `client | trainer | admin`
4. Required standard attributes: email (verified), name.
5. Enable email as username alias.

For the first demo week you may skip Hosted UI and issue tokens via `USER_PASSWORD_AUTH` from the API’s `/auth/login` wrapper (API verifies password with Cognito Admin/InitiateAuth). Prefer Cognito-native login long-term.

### 3.2 S3 (media)

Bucket: `kwoka-test-media-<account-id>` (globally unique).

- Block all public access.
- CORS allow `PUT`/`GET` from landing origin and mobile (or `*` for test only).
- Default encryption: SSE-S3.
- Lifecycle: abort incomplete multipart after 1 day; transition to **Intelligent-Tiering** after 30 days (optional).

**Key layout:**

```text
avatars/{user_id}/{media_id}.{ext}
progress/{client_id}/{media_id}.{ext}
messages/{conversation_key}/{media_id}.{ext}
exercises/{exercise_id}/{media_id}.{ext}
blog/{post_id}/{media_id}.{ext}
tmp/uploads/{user_id}/{upload_id}.{ext}   # short-lived; promote after confirm
```

### 3.3 RDS PostgreSQL

- Engine: PostgreSQL 16
- Instance: `db.t4g.micro` (or free-tier `db.t3.micro` if eligible)
- Storage: 20 GB gp3, **single-AZ**, no Multi-AZ
- Public access: **off**; Lambda in same VPC (or use RDS Proxy only if needed later)
- DB name: `kwoka`
- Credentials: Secrets Manager or SSM SecureString

**Budget tip:** stop/start is not supported for classic RDS the same way as EC2; for long pauses **snapshot + delete** the instance and restore when testing resumes.

### 3.4 Lambda + HTTP API

- Runtime: Node.js 20 (or Python 3.12)
- Memory: 256–512 MB
- Timeout: 10–15 s (uploads intents + booking conflicts)
- VPC: attach only if RDS is private (adds cold-start cost; acceptable for test)
- API Gateway **HTTP API** (cheaper than REST API) with JWT authorizer → Cognito
- Routes mirror [`api-contract.md`](./api-contract.md)

### 3.5 SES

- Leave in **sandbox**.
- Verify sender (e.g. `noreply@yourdomain`) and any test recipient inboxes.
- Use for contact form ACKs and newsletter confirmations only.

### 3.6 IAM (least privilege)

- Lambda role: `rds-db:connect` or security-group access to Postgres, `s3:PutObject`/`GetObject` on the media bucket prefix, `ses:SendEmail`, `ssm:GetParameters`.
- No `*` on S3 bucket beyond the media bucket.

---

## 4. Database schema

Canonical SQL lives in [`sql/001_init_schema.sql`](./sql/001_init_schema.sql). Summary below.

### 4.1 ER domains

```text
users ─┬─ client_profiles ── trainer_client_links ── trainer_profiles
       │
       ├─ media_files
       ├─ notification_preferences / device_tokens / notifications
       │
       ├─ exercises / workouts / workout_exercises / workout_completions
       ├─ workout_plans / routine_assignments / exercise_feedback
       │
       ├─ appointments / blocked_times
       ├─ messages / message_attachments
       ├─ progress_entries
       │
       ├─ products / orders / order_lines / session_credit_ledger
       └─ contact_submissions / issue_submissions / newsletter_subscriptions
           blog_posts / blog_comments
```

### 4.2 Status mapping (appointments)

| Landing | Mobile | DB `appointments.status` |
|---------|--------|---------------------------|
| pending | — | `pending` |
| confirmed | scheduled | `confirmed` |
| cancelled | cancelled | `cancelled` |
| — | completed | `completed` |

### 4.3 Session credits

Do **not** store only a mutable integer. Use a ledger:

- `session_credit_ledger`: grants (orders), spends (confirmed bookings), adjustments (admin).
- `GET /session-credits/me` sums grants − spends for the current month (or rolling window).

### 4.4 Soft deletes

Prefer `deleted_at TIMESTAMPTZ` on workouts, messages (optional), products, blog posts. Hard-delete media objects from S3 only after DB row is marked deleted.

---

## 5. Storage & media flow

1. Client calls `POST /media/upload-intents` with `purpose`, `contentType`, `size`.
2. API validates MIME allow-list and max size per purpose:

| Purpose | Max size (test) | Allowed types |
|---------|-----------------|---------------|
| `avatar` | 2 MB | jpeg, png, webp |
| `progress-photo` | 8 MB | jpeg, png, webp |
| `message-attachment` | 15 MB | jpeg, png, webp, pdf, mp4 |
| `exercise-media` | 50 MB | jpeg, png, webp, mp4 |
| `blog-cover` | 5 MB | jpeg, png, webp |

3. API inserts `media_files` row (`status = pending`), returns pre-signed PUT URL + `fileId`.
4. Client uploads to S3.
5. Client attaches `fileId` on progress/message/workout payload; API sets `status = ready` and binds ownership.

Downloads: pre-signed GET (5–15 min TTL). Never make the bucket public.

---

## 6. Forms → tables map

| Form / UI surface | App | Table(s) |
|-------------------|-----|----------|
| Register / Login | both | Cognito + `users` (+ role profile) |
| Profile / goals / measurements prefs | both | `users`, `client_profiles`, `trainer_profiles` |
| Contact | landing | `contact_submissions` (+ SES) |
| Issue / support | landing | `issue_submissions` |
| Newsletter | landing | `newsletter_subscriptions` |
| Checkout | landing | `orders`, `order_lines`, `session_credit_ledger` |
| Booking request | landing + mobile | `appointments`, credit spend row |
| Trainer lock day / block | both | `blocked_times` |
| Workout create / assign | mobile (+ landing trainer) | `workouts`, `workout_exercises`, `routine_assignments` |
| Workout complete / miss | mobile | `workout_completions` |
| Exercise feedback + clips | mobile | `exercise_feedback`, `media_files` |
| Progress photo / measurement / note | mobile | `progress_entries`, `media_files` |
| DM / broadcast | mobile (+ landing chat) | `messages`, `message_attachments` |
| Notification prefs / push token | mobile | `notification_preferences`, `device_tokens` |
| Blog create | landing trainer | `blog_posts`, `blog_comments` |
| Store catalog | landing | `products` (seeded) |

---

## 7. Step-by-step setup

### Prerequisites

- AWS account with billing alerts (e.g. $30 threshold).
- AWS CLI configured (`aws configure`).
- `psql` locally (or use Query Editor once RDS is reachable).

### Steps

1. **Create Cognito User Pool** and two app clients; note Pool ID and Client IDs.
2. **Create S3 bucket** with public access blocked + CORS.
3. **Create VPC** (or use default): 2 private subnets for RDS + Lambda; 1 security group `sg-db` (5432 from `sg-lambda` only), `sg-lambda` egress all.
4. **Create RDS** Postgres; store password in SSM `/kwoka/test/db_url`.
5. **Apply schema:**

   ```bash
   psql "$DATABASE_URL" -f docs/sql/001_init_schema.sql
   psql "$DATABASE_URL" -f docs/sql/002_seed_demo.sql
   ```

6. **Create Lambda** (single “router” function is fine for test) + HTTP API JWT authorizer.
7. **Grant Lambda** S3 + SES + SSM + SG access to RDS.
8. **Seed Cognito users** matching seed emails (`coach@kwoka.fit`, demo clients) with temp passwords.
9. **Point frontends** at the HTTP API URL; replace mock modules gradually with `fetch`.
10. **Verify cross-app:** create booking on landing → appear on mobile calendar for same user; send message on mobile → visible in landing trainer chat once wired.

### Tear-down (save money)

1. Delete HTTP API + Lambda.
2. Snapshot RDS → delete DB instance.
3. Empty + delete S3 bucket (or keep empty bucket; storage ≈ $0).
4. Cognito User Pool can remain (free at low MAU) or be deleted.

---

## 8. Security baseline (test, still serious)

Aligned with [`testing-security-plan.md`](./testing-security-plan.md):

- JWT required on all routes except `POST /auth/*`, `GET /products`, public blog, `POST /contact/*`, `POST /newsletter/subscriptions`.
- Never trust `role`, prices, credit counts, or IDs from the body for authorization.
- Enforce `trainer_client_links` on messages, progress, and client detail.
- Booking writes: check blocked times + overlapping appointments in a transaction.
- Credits: only ledger writes from order confirmation (mock webhook in test) and booking confirmation.
- Rate-limit auth/contact/newsletter via API Gateway stage throttling (e.g. 5 rps burst 10 on those routes).
- No secrets in frontend repos; only public Cognito client IDs and API base URL.

---

## 9. Local vs AWS test

| Mode | When to use |
|------|-------------|
| Frontend mocks (current) | UI work without AWS spend |
| Local Docker Postgres + schema SQL | Schema/API development offline |
| Full AWS test stack | Integration demos, mobile ↔ landing sharing |

Recommended local compose (optional later): `postgres:16` + API container using the same SQL files so AWS and laptop stay aligned.

---

## 10. Cost guardrails

- Enable **AWS Budgets** + email alert at $20 and $40.
- One region, one RDS, no Multi-AZ, no NAT Gateway if you can avoid it (NAT alone can exceed RDS cost). Prefer **public Lambda + RDS in public subnet with SG lockdown** only for short-lived demos, or accept NAT (~$32/mo) and plan tear-down carefully.
- **NAT-free pattern for test:** place RDS in a public subnet, `PubliclyAccessible=true`, security group limited to your IP + Lambda ENI… better: use **RDS Data API** is Aurora-only. Simplest budget path: **Lightsail Postgres** or **single Lightsail box** to avoid NAT entirely.
- Delete unused Elastic IPs, load balancers, and idle volumes.

**Recommended budget path:** Lightsail ($7) for API+Postgres **or** RDS micro **without NAT** (temporary public RDS locked to your IP) + Lambda outside VPC calling Postgres over TLS. Move to private VPC+NAT only when hardening toward production.

---

## 11. Acceptance checks

- [ ] Cognito login works from landing and mobile for the same email.
- [ ] `users` row created/linked on first login (`cognito_sub`).
- [ ] Trainer sees only linked clients.
- [ ] Booking on landing consumes a credit ledger entry and shows on mobile.
- [ ] Progress photo: signed upload → S3 object → `progress_entries` references `media_files`.
- [ ] Message with attachment round-trips for assigned trainer/client.
- [ ] Contact + newsletter rows appear in DB; SES sends in sandbox.
- [ ] Order “webhook” (mock) grants package credits; UI cannot invent credits.
- [ ] Monthly AWS bill stays within budget alert.

---

## Related docs

- [`api-contract.md`](./api-contract.md) — REST shapes both apps should call
- [`frontend-requirements.md`](./frontend-requirements.md) — shared product model
- [`testing-security-plan.md`](./testing-security-plan.md) — test + security expectations
- [`sql/001_init_schema.sql`](./sql/001_init_schema.sql) — full DDL
- [`sql/002_seed_demo.sql`](./sql/002_seed_demo.sql) — demo seed data
