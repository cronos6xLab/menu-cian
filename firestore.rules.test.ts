/**
 * Security Rules Verification Suite (Phase 0 TDD — Dirty Dozen Payloads)
 * Documents the 12 adversarial payloads that firestore.rules MUST reject with PERMISSION_DENIED.
 */

export interface AdversarialCase {
  id: number;
  name: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: AdversarialCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Order Create',
    operation: 'create',
    path: '/orders/order_001',
    auth: { uid: 'uid_attacker', email: 'a@example.com', email_verified: true },
    payload: { customerId: 'uid_victim', orderCode: 'SC-1001', status: 'received' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'State Shortcutting on Order Create',
    operation: 'create',
    path: '/orders/order_002',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { customerId: 'uid_user', orderCode: 'SC-1002', status: 'delivered' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Price Tampering on Order Update',
    operation: 'update',
    path: '/orders/order_003',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { totalMxn: 1, subtotalMxn: 1 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Order Create',
    operation: 'create',
    path: '/orders/order_004',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { customerId: 'uid_user', orderCode: 'SC-1004', status: 'received', isPaid: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Terminal / In-Progress Cancel Violation',
    operation: 'update',
    path: '/orders/order_delivered',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { status: 'cancelled' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'PII Leak via Direct Get by Non-Owner',
    operation: 'get',
    path: '/orders/order_of_user_A',
    auth: { uid: 'uid_user_B', email: 'b@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Unscoped List Scraping on Orders',
    operation: 'list',
    path: '/orders',
    auth: { uid: 'uid_user_B', email: 'b@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Menu Hijack by Customer',
    operation: 'update',
    path: '/menuItems/slime-classic',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { priceMxn: 1 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning on Path Variable',
    operation: 'create',
    path: '/orders/bad$id..invalid!'.repeat(20),
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { customerId: 'uid_user', orderCode: 'SC-1009', status: 'received' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Denial-of-Wallet Oversized Notes',
    operation: 'create',
    path: '/orders/order_010',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { customerId: 'uid_user', notes: 'x'.repeat(5000) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Timestamp Spoofing on Create',
    operation: 'create',
    path: '/orders/order_011',
    auth: { uid: 'uid_user', email: 'u@example.com', email_verified: true },
    payload: { customerId: 'uid_user', createdAt: '1999-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unverified Admin Email Spoofing',
    operation: 'update',
    path: '/settings/storefront',
    auth: { uid: 'uid_spoof', email: 'cronos6xlab@gmail.com', email_verified: false },
    payload: { whatsappNumber: '5215500000000' },
    expected: 'PERMISSION_DENIED',
  },
];
