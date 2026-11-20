# NutriVerify Security Specification (Phase 0 — Payload-First Security TDD)

## 1. Data Invariants

1. **PII Isolation (`users/{userId}`)**: A user profile contains PII (`email`, `phone`, `hostelOrAddress`) and may ONLY be read (`get`), created, or updated by the authenticated owner (`request.auth.uid == userId`). Collection `list` on `/users` is strictly forbidden.
2. **Identity Integrity**: Every document created in `users`, `orders`, `batchVerifications`, and `ambassadorApplications` MUST bind its `uid`/`userId` field to `request.auth.uid` and require `request.auth.token.email_verified == true`.
3. **Immutable Ownership & Timestamps**: `uid`, `userId`, `createdAt`, `verifiedAt`, `referralCode`, `referralCount`, and `orderNumber` are strictly immutable after creation. All timestamps must equal `request.time` on write.
4. **Order State Machine & Terminal Locking (`orders/{orderId}`)**: New orders must initialize with `status == 'confirmed'`. Once an order reaches a terminal state (`'delivered'` or `'cancelled'`), NO further updates are allowed. Customers can ONLY transition `'confirmed' -> 'cancelled'` updating exclusively `['status', 'updatedAt']`.
5. **Bounded Arrays & Volumetric Caps**: `batchCodes` in `orders` is bounded to `1..10` items and checked for element string type. Every string field enforces strict `.size()` bounds matching `firebase-blueprint.json`.
6. **Zero Client Query Delegation**: Every `allow list` rule explicitly enforces `resource.data.userId == request.auth.uid` with zero `get()`/`exists()` calls.
7. **Ambassador Anti-Escalation (`ambassadorApplications/{userId}`)**: Applications must initialize with `status == 'submitted'`. Applicants cannot self-approve (`status` is excluded from update `affectedKeys`).

---

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: `PERMISSION_DENIED`)

1. **Identity Spoofing on Order Create**: User A attempts to create an order with `userId: "user_B"`.
2. **Shadow Field Injection on User Profile**: User A creates `/users/user_A` adding ghost field `isAdmin: true`.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create a `batchVerifications` record.
4. **Cross-User PII Read**: User B attempts `get` on `/users/user_A`.
5. **Blanket User Listing**: User A attempts `list` on `/users`.
6. **Order Status Self-Escalation**: User A attempts to create an order with `status: "delivered"`.
7. **Terminal State Resurrection**: User A attempts to update a `'cancelled'` order back to `'confirmed'`.
8. **Price Tampering on Update**: User A attempts to update `totalInr: 1` on a `'confirmed'` order.
9. **Path ID Poisoning**: User A attempts to write to `/orders/../../evil$id!` (invalid characters / > 128 chars).
10. **Denial-of-Wallet Oversized String**: User A submits `itemsSummary` with 5,000 characters (exceeds 500-char blueprint cap).
11. **Array Type/Size Poisoning**: User A creates an order with 15 `batchCodes` or `batchCodes: [12345]`.
12. **Client Timestamp Forgery**: User A creates a `batchVerifications` doc with a forged client timestamp (`new Date('2020-01-01')`) instead of `serverTimestamp()`.
