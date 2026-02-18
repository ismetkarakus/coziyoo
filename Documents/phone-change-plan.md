# Phone Change Confirmation Flow Plan

## 1. Define Flow and States
- User edits phone in `/personal-info`.
- App shows modal: "We’ll email a confirmation link. Your phone changes only after confirmation."
- On confirm, create a pending phone change request, do not update `phone` yet.
- Send email link with secure token.
- User clicks link -> webhook/confirm endpoint validates token -> applies new phone.
- Mark request as completed, expired, or cancelled.

## 2. Data Model Changes
- Add fields on user (or separate table `phone_change_requests`):
  - `pendingPhoneNew`
  - `pendingPhoneOld`
  - `pendingPhoneRequestedAt`
  - `pendingPhoneTokenHash`
  - `pendingPhoneTokenExpiresAt`
  - `pendingPhoneStatus` (`pending`, `confirmed`, `expired`, `cancelled`)
  - `pendingPhoneConfirmedAt`
- Prefer separate table for audit/history; user table can keep only active pending request pointer.

## 3. Backend API
- `POST /auth/me/:uid/phone-change/request`
  - Input: `newPhone`
  - Creates pending request + token, sends email.
- `GET /auth/phone-change/confirm?token=...&uid=...` (or `POST` if webhook style)
  - Validates token, expiry, and status.
  - Applies `phone = pendingPhoneNew`, clears pending fields.
- Optional: `POST /auth/me/:uid/phone-change/cancel`.

## 4. Email and Webhook Integration
- Use mail provider/webhook service to send:
  - Link: `https://<your-domain>/auth/phone-change/confirm?token=<token>&uid=<uid>`
- Keep token signed/random, store only hash server-side.
- Confirm/webhook handler must be idempotent (safe on repeated clicks).

## 5. Frontend Changes
- `/personal-info`:
  - If phone changed, intercept save and show confirmation modal.
  - Call `phone-change/request` instead of direct profile update for phone.
  - Show "Pending confirmation" state and allow resend/cancel.
- Keep other profile fields saving normally.

## 6. Security and Validation
- Rate-limit request endpoint.
- Expiry window (for example 30 to 60 minutes).
- One active request per user (new request invalidates old token).
- Log IP/user-agent for confirm request.
- Return generic errors for invalid/expired token.

## 7. Admin and Audit
- Add audit events:
  - `phone_change_requested`
  - `phone_change_confirmed`
  - `phone_change_expired`
  - `phone_change_cancelled`
- Optional admin view for pending requests.

## 8. Testing
- Unit: token generation/validation, expiry, idempotency.
- Integration: request -> email link -> confirm -> phone updated.
- Regression: normal profile save still works when phone unchanged.

## Suggested Implementation Strategy
- Start with minimal schema (`pending` fields on `users`) for speed.
- Refactor to dedicated `phone_change_requests` table later if audit/history requirements grow.
