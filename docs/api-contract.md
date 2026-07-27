# Demo Backend API Contract Draft

This draft describes the backend-facing contract the mobile app and landing webapp should be prepared to consume. The initial implementation can remain mock-backed, but payloads and ownership rules should match this contract closely enough that an AWS demo backend can replace local mocks later.

## Contract principles

- The backend is the source of truth for identity, roles, trainer-client relationships, bookings, payments, session credits, and media access.
- Frontends may send intent, but protected identifiers such as `userId`, `trainerId`, and `clientId` must be verified from the authenticated user on the server.
- All endpoints return stable IDs, ISO timestamps, and explicit status fields.
- List endpoints should support pagination once real data is used.
- Error responses should include a machine-readable code and user-safe message.

Example error:

```json
{
  "code": "BOOKING_CONFLICT",
  "message": "That time slot is no longer available."
}
```

## Auth

Auth is backed by **Amazon Cognito**. Email/password sign-up requires **email confirmation**. Social login uses Cognito federation (**Facebook / Meta**). The mobile Instagram button should use that Meta federation in the test environment (Cognito has no native Instagram IdP). See [`aws-test-environment.md`](./aws-test-environment.md) §3.1.

### `POST /auth/register`

Creates a member/client account. User remains **unconfirmed** until email verification succeeds. Do **not** return a full session JWT until confirmed (unless product explicitly allows a limited unverified session).

Request:

```json
{
  "name": "Alex Client",
  "email": "alex@example.com",
  "password": "example-password",
  "roleHint": "client"
}
```

Response (`201`):

```json
{
  "status": "UNCONFIRMED",
  "email": "alex@example.com",
  "message": "Check your email for a confirmation code."
}
```

### `POST /auth/confirm-email`

Confirms sign-up with the code Cognito emailed (or SES-backed Cognito template).

Request:

```json
{
  "email": "alex@example.com",
  "code": "123456"
}
```

Response:

```json
{
  "status": "CONFIRMED",
  "email": "alex@example.com"
}
```

Client should proceed to `POST /auth/login` after success.

### `POST /auth/resend-confirmation`

Resends the email confirmation code for an `UNCONFIRMED` user.

Request:

```json
{
  "email": "alex@example.com"
}
```

### `POST /auth/login`

Authenticates a confirmed email/password user as a client/member or trainer. Reject unconfirmed users with `EMAIL_NOT_VERIFIED`.

Request:

```json
{
  "email": "coach@kwoka.fit",
  "password": "example-password",
  "roleHint": "trainer"
}
```

Response:

```json
{
  "token": "jwt",
  "user": {
    "id": "trainer-1",
    "name": "Kwoka Coach",
    "email": "coach@kwoka.fit",
    "role": "trainer",
    "emailVerified": true
  }
}
```

### `GET /auth/social/{provider}/start`

Starts Cognito Hosted UI / federation. `provider` is `facebook` (Meta). Treat `instagram` as an alias that redirects to the same Meta/Facebook IdP in the test env, or return `501` with a clear message if product defers it.

Query: `redirectUri`, optional `roleHint`.

Response: `{ "authorizeUrl": "https://….amazoncognito.com/oauth2/authorize?…" }`

### `GET /auth/social/callback` (or client-side PKCE exchange)

Exchanges the auth code for tokens, upserts `users` + `user_identities`, returns the same session shape as login. Prefer completing the code exchange in the app (PKCE) against Cognito token endpoint when using public clients.

### `GET /auth/me`

Returns the authenticated user and role-specific profile summary, including `emailVerified` and linked providers (`password`, `facebook`).

## Users and trainer-client relationships

### `GET /users/me`

Returns the current user profile.

### `PATCH /users/me`

Updates safe profile fields such as display name, avatar, goals, notification preferences, or measurement preferences.

### `GET /trainers/me/clients`

Trainer-only. Returns clients assigned to the authenticated trainer.

### `GET /trainers/me/clients/:clientId`

Trainer-only. Returns a single assigned client plus progress/workout/booking summary.

### `GET /clients/me/trainer`

Client-only. Returns the assigned trainer profile.

## Workouts and exercises

### `GET /exercises`

Returns the exercise library.

### `GET /workouts`

Returns workouts visible to the authenticated user.

### `POST /workouts`

Trainer or authorized client action depending on product rules. Creates a workout.

### `PATCH /workouts/:id`

Updates workout metadata, exercise list, or schedule date.

### `DELETE /workouts/:id`

Deletes or archives a workout.

### `POST /workouts/:id/completions`

Records completion, unfinished exit, or missed status.

Request:

```json
{
  "finished": true,
  "completedExerciseIds": ["exercise-1", "exercise-2"],
  "completedAt": "2026-04-27T16:00:00.000Z"
}
```

## Progress

### `GET /clients/:clientId/progress`

Returns progress entries. Clients can access only their own entries; trainers can access assigned clients.

### `POST /clients/:clientId/progress`

Creates a measurement, note, or photo entry.

Request:

```json
{
  "type": "measurement",
  "date": "2026-04-27T16:00:00.000Z",
  "measurements": {
    "weight": 180,
    "waist": 34
  },
  "notes": "Optional note"
}
```

## Media

### `POST /media/upload-intents`

Creates a signed upload target for progress photos, avatars, or message attachments.

Request:

```json
{
  "purpose": "progress-photo",
  "contentType": "image/jpeg",
  "size": 1024000
}
```

Response:

```json
{
  "uploadUrl": "https://signed-upload-url",
  "fileUrl": "https://cdn.example.com/protected/file.jpg",
  "fileId": "file-1",
  "headers": {
    "Content-Type": "image/jpeg"
  }
}
```

## Calendar, bookings, and availability

### `GET /appointments`

Returns appointments visible to the authenticated user.

### `POST /appointments`

Creates a booking request. The backend must verify session credits and prevent conflicts.

Request:

```json
{
  "trainerId": "trainer-1",
  "startTime": "2026-04-28T14:00:00.000Z",
  "endTime": "2026-04-28T15:00:00.000Z",
  "title": "Training session"
}
```

Response status starts as `pending` unless product rules allow instant confirmation.

### `PATCH /appointments/:id/status`

Trainer/client action depending on transition.

Allowed statuses:

- `pending`
- `confirmed`
- `cancelled`
- `completed`

### `GET /trainers/:trainerId/availability`

Returns availability windows and blocked time for booking UI.

### `POST /trainers/me/blocked-times`

Trainer-only. Blocks a time range or full day.

## Messages

### `GET /messages/conversations`

Returns conversation summaries.

### `GET /messages/conversations/:otherUserId`

Returns messages between the authenticated user and an authorized participant.

### `POST /messages`

Sends a direct or trainer broadcast message.

Request:

```json
{
  "receiverIds": ["client-1"],
  "content": "Great job today.",
  "attachmentIds": []
}
```

### `POST /messages/:id/read`

Marks a message as read by the authenticated receiver.

## Products, orders, payments, and credits

### `GET /products`

Returns store products and packages.

Product types:

- `physical`
- `digital`
- `session_package`
- `subscription`

### `POST /orders`

Creates an order draft from cart contents.

### `POST /payments/checkout-session`

Creates a Stripe/PayPal-style checkout session for an order.

### `POST /payments/webhooks/:provider`

Provider webhook endpoint. This is the only production path that may mark orders paid and grant credits.

### `GET /orders/me`

Returns the authenticated member's order history.

### `GET /session-credits/me`

Returns current month session allowance, used count, and remaining count.

## Contact, issues, and newsletter

### `POST /contact/messages`

Stores a general contact request and optionally sends an email notification.

### `POST /contact/issues`

Stores a support/technical issue.

### `POST /newsletter/subscriptions`

Creates or updates newsletter subscription status.

## Notifications

### `PATCH /notifications/preferences`

Updates push/email notification preferences.

### `POST /notifications/devices`

Registers a mobile push token for the authenticated user.

## Future AWS mapping

- API Gateway + Lambda or ECS/Fargate for REST endpoints.
- Cognito or custom JWT auth for identity and role claims.
- RDS/Aurora PostgreSQL for relational data.
- S3 + signed URLs for media.
- SES for email notifications.
- EventBridge/SQS for reminders, webhook processing, and async notifications.

For the **budget test environment**, full setup steps, shared Postgres schemas, S3 key layout, and mobile↔landing data rules live in [`aws-test-environment.md`](./aws-test-environment.md) and [`sql/001_init_schema.sql`](./sql/001_init_schema.sql).
