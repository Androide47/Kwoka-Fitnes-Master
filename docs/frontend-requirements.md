# Frontend Completion Requirements

This document captures the frontend requirements needed before wiring the mobile app and landing webapp to a demo backend. The current mobile app is the reference implementation for product depth; the landing webapp should align with these concepts without changing the existing visual direction.

## Shared product model

Both frontends should be prepared to consume the same backend concepts:

- Users with stable IDs, names, emails, avatars, and roles.
- Roles: `client`, `trainer`, and a future `admin` role if operations require it.
- Trainer-client relationships that determine visibility and permissions.
- Session credits that control booking eligibility.
- Bookings/appointments with conflict handling and status transitions.
- Trainer availability and blocked time.
- Workouts, exercises, workout plans, and completion history.
- Progress entries for measurements, notes, and photos.
- Messages and message attachments between assigned trainers and clients.
- Products, carts, orders, packages, and subscriptions.
- Contact messages, issue reports, and newsletter subscriptions.
- Notification preferences and future push/email notification delivery.

## Mobile app frontend requirements

The mobile app should keep its current user experience and move data access behind API-shaped modules.

### Auth and profile

- Support trainer and client login.
- Support client/trainer sign-up demo flow.
- Persist the current user locally for demo/offline use.
- Expose role state consistently to route guards and stores.
- Keep profile updates compatible with future API payloads.

### Workouts

- Load exercises and workouts through a workouts API boundary.
- Support workout creation, updates, deletion, active sessions, and completion.
- Preserve scheduled workout date behavior.
- Mark past-due workouts as missed.
- Keep completion history backend-ready.

### Calendar and bookings

- Load appointments through a calendar API boundary.
- Support creating, updating, cancelling, and deleting appointments.
- Support trainer blocked time and full-day blocks.
- Keep availability checks aligned with the landing booking model.

### Progress

- Load progress entries through a progress API boundary.
- Support measurements, notes, and photo entries.
- Prepare photo selection and saved photo URLs for future signed S3 upload flow.

### Messages

- Load conversations through a messages API boundary.
- Support sending messages, broadcasts, read state, and attachments.
- Keep message visibility tied to the authenticated user and assigned relationships.

### Notifications

- Store notification preferences in a backend-compatible shape.
- Prepare for push token registration without requiring production push delivery yet.

## Landing/webapp frontend requirements

The landing app should remain visually consistent and become demo-complete for the product flows that future backend APIs will power.

### Auth

- Support member and trainer demo sessions.
- Use role-aware session objects, not only loose localStorage email values.
- Guard member-only and trainer-only routes.
- Keep login/register flows backend-ready.

### Member area

- Show session credit summary.
- Show upcoming bookings and booking statuses.
- Allow booking requests when credits are available.
- Show order history from demo order data.
- Show profile/account summary and useful empty states.

### Trainer area

- Show overview metrics.
- Show client list from a trainer API boundary.
- Add client detail route or equivalent detail view.
- Show pending/upcoming bookings.
- Support confirming and cancelling requests.
- Provide placeholders for client progress and messaging links.

### Store and checkout

- Distinguish product kinds: physical, digital, session package, and subscription.
- Create demo order records.
- Clear cart after successful demo checkout.
- Grant demo session credits only through the mock order/payment API boundary.
- Show checkout success/confirmation state.

### Contact and marketing capture

- Submit contact, issue, and newsletter forms through API-shaped modules.
- Validate required fields.
- Expose loading, success, and error states.
- Persist demo submissions locally so integration tests can verify behavior.

## Non-goals for this frontend pass

- No production AWS implementation.
- No real payment processing.
- No real S3 uploads.
- No visual redesign.
- No broad style changes.
- No backend secrets or credentials in frontend code.
