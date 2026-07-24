# Testing and Security Readiness Plan

This plan defines the frontend integration and security coverage needed while the project is still running on mock APIs. The goal is to make backend wiring safer by proving the UI flows, mock contracts, and role boundaries before replacing mock persistence with AWS services.

## Testing strategy

### Landing webapp

Use the existing Vite/Vitest setup for integration and contract-style tests. Playwright can be used for browser-level flows once the core mock API boundaries are stable.

Recommended integration coverage:

- Member registration/login reaches the member dashboard.
- Trainer login reaches the trainer area.
- Unauthenticated visitors are redirected away from protected routes.
- Member users cannot access trainer-only pages.
- Trainer users cannot access member-only pages unless a future requirement allows it.
- Member with credits can request a booking.
- Member without credits sees booking disabled/blocked.
- Conflicting slots cannot be booked twice.
- Trainer can confirm or cancel pending requests.
- Cancelled bookings free the slot.
- Checkout creates a demo order.
- Session packages add demo credits only through the order API path.
- Cart clears after successful checkout.
- Order history appears in the member dashboard.
- Contact, issue, and newsletter forms validate required fields and record demo submissions.

### Mobile app

Add focused tests around stores and API modules before expanding into full component tests. The mobile app is already more complete, so the first coverage should protect behavior rather than visual output.

Recommended coverage:

- Trainer login returns trainer state and clients.
- Client login returns client state.
- Logout clears auth state.
- Workout hydration loads workouts/exercises.
- Completing a workout updates completion state.
- Past-due sync marks missed workouts.
- Appointments hydrate by user.
- Booking/cancellation updates calendar state.
- Blocked trainer time affects availability.
- Conversation hydration filters trainer/client messages.
- Sending a message adds the expected unread message.
- Progress measurement, note, and photo entries are created with expected shapes.

### Contract tests

Mock API modules should be tested because they become the seam for the future backend.

Recommended coverage:

- Auth API returns normalized session/current-user shapes.
- Product API returns product type metadata.
- Order API creates order records and updates credits only after successful mock checkout.
- Booking API enforces conflicts and credit checks.
- Trainer API only returns clients assigned to the trainer.
- Contact/newsletter APIs persist normalized submissions.
- Media API returns a signed-upload-style placeholder shape.

## Security readiness

### Frontend tests

Add security-oriented tests for:

- Protected routes redirect unauthenticated users.
- Role-protected routes reject wrong-role sessions.
- Local session parsing rejects malformed or incomplete session data where practical.
- Contact, issue, newsletter, checkout, and booking forms reject invalid input.
- Booking rejects past dates and conflicting slots.
- Client-only users cannot call trainer confirmation/cancellation controls through UI paths.
- Trainer users cannot view unrelated mock clients.
- Session credits are changed through the mock order API, not direct checkout component mutation.
- Media upload placeholders validate file type and size before saving progress photo records.

### Backend expectations for AWS

The future backend must enforce the real security boundary. The frontend can guide and test behavior, but it must not be trusted for protected decisions.

Required backend rules:

- Use authenticated token claims for user identity.
- Never trust role, trainer ID, client ID, price, credit count, or order totals sent by the frontend.
- Enforce trainer-client relationships server-side.
- Enforce role permissions server-side for every protected endpoint.
- Validate booking conflicts with transactional writes or locks.
- Update paid orders and credits only from payment provider webhooks.
- Validate product prices server-side.
- Use signed S3 URLs for uploads/downloads.
- Validate file type, file size, and ownership before accepting media.
- Store secrets only in backend environment variables or secret managers.
- Rate limit auth, contact, newsletter, and issue endpoints.
- Record audit events for payment, booking, trainer, and profile changes.
- Use least-privilege IAM policies for API, database, S3, queues, and notifications.

## Verification commands

Landing webapp:

```sh
npm run build
npm run lint
npm run test
```

Mobile app:

```sh
npm run test
```

If the mobile test script is not available yet, add it alongside focused Jest tests for store/API behavior.
