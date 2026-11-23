# Security Specification — Slime Craft Burgers

## 1. Data Invariants

1. **Public Catalog Integrity (`menuItems`)**: Anyone can read the menu catalog (`get`/`list`), but ONLY verified admins (`isAdmin()`) can create, edit, toggle availability, or delete menu items. All strings and arrays are strictly size-bounded.
2. **Order Ownership & PII Isolation (`orders`)**: Orders contain delivery addresses, table numbers, and customer names (PII). An authenticated verified customer may only create an order where `customerId == request.auth.uid`, `status == 'received'`, and `createdAt == request.time`. Customers can only read/list their own orders (`resource.data.customerId == request.auth.uid`).
3. **Order Lifecycle State Machine & Terminal Locking**:
   - Regular customers may ONLY cancel their own order when `existing().status == 'received'`, modifying strictly `['status', 'updatedAt']` to `status == 'cancelled'`.
   - Verified admins/kitchen staff may transition orders across `received -> crafting -> grill -> ready -> delivered` or `cancelled`, or apply administrative corrections (`isAdmin()` override).
   - Once an order reaches a terminal state (`delivered` or `cancelled`), non-admin updates are permanently blocked.
4. **Immutable Order Fields**: `customerId`, `orderCode`, `createdAt`, `items`, `subtotalMxn`, `discountMxn`, `totalMxn` cannot be mutated by non-admin users after creation.
5. **Storefront Settings (`settings/storefront`)**: Public non-PII configuration readable by anyone; writable exclusively by verified admins with strict phone number regex (`^[0-9]{10,15}$`).
6. **Privilege Escalation Prevention (`admins`)**: Clients can never write to `admins/{adminId}` unless already a verified bootstrapped admin.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)

1. **Identity Spoofing on Order Create**: Authenticated user `uid_attacker` creates an order with `customerId: "uid_victim"`.
2. **State Shortcutting on Order Create**: Customer creates a new order directly with `status: "delivered"` instead of `"received"`.
3. **Price Tampering on Order Update**: Customer updates their own order to change `totalMxn: 1` and `subtotalMxn: 1`.
4. **Shadow Field Injection on Order Create**: Customer submits a valid order plus `"isPaid": true` (ghost field not in `hasOnly`).
5. **Terminal State Violation**: Customer tries to update an order already in `status: "delivered"` or `status: "grill"` back to `"cancelled"`.
6. **PII Leak via Direct Get**: User B calls `get(/orders/order_of_user_A)` without being owner or admin.
7. **Unscoped List Scraping**: User B calls `list(/orders)` without matching `customerId == request.auth.uid`.
8. **Menu Hijack by Customer**: Authenticated non-admin attempts `create` or `update` on `/menuItems/burger_1` to set `priceMxn: 1`.
9. **ID Poisoning**: Attacker writes to `/orders/` with a 300-character document ID containing special characters (`../../evil`).
10. **Denial-of-Wallet Oversized Payload**: Customer creates an order with `notes` of 5,000 characters or `items` array of 50 entries.
11. **Timestamp Spoofing**: Customer creates an order with a client-forged `createdAt` timestamp instead of `request.time`.
12. **Unverified Admin Email Spoofing**: Token has `email: "cronos6xlab@gmail.com"` with `email_verified: false` attempting to write to `/settings/storefront` or `/admins/attacker`.
