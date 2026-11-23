import {
  CartItem,
  FulfillmentType,
  Order,
  OrderLineItem,
  SCHEMA_LIMITS,
  SelectedExtra,
} from '../types/menu';

export function formatMxn(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `$${safe.toLocaleString('es-MX')} MXN`;
}

export function buildCartKey(
  menuItemId: string,
  removedIngredients: string[],
  selectedExtras: SelectedExtra[]
): string {
  const removedKey = [...removedIngredients].sort().join('|');
  const extrasKey = [...selectedExtras]
    .filter((e) => e.quantity > 0)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join('|');
  return `${menuItemId}__rm:${removedKey}__ex:${extrasKey}`;
}

export interface CartPricingSummary {
  itemCount: number;
  subtotalMxn: number;
  twoForOneFreeCount: number;
  twoForOneDiscountMxn: number;
  comboSavingsMxn: number;
  totalDiscountMxn: number;
  discountLabel: string;
  totalMxn: number;
  eligible2x1Units: number;
  needsOneMoreFor2x1: boolean;
}

/**
 * Deterministic 2x1 and Combo savings calculator.
 * For every 2 units marked `promoType === '2x1'`, the lowest base-price unit is discounted 100%.
 */
export function calculateCartPricing(cart: CartItem[]): CartPricingSummary {
  let itemCount = 0;
  let subtotalMxn = 0;
  let comboSavingsMxn = 0;
  const twoForOneUnitPrices: number[] = [];

  for (const item of cart) {
    itemCount += item.quantity;
    subtotalMxn += item.unitPriceMxn * item.quantity;

    if (item.promoType === 'combo' && item.originalPriceMxn && item.originalPriceMxn > item.basePriceMxn) {
      comboSavingsMxn += (item.originalPriceMxn - item.basePriceMxn) * item.quantity;
    }

    if (item.promoType === '2x1') {
      for (let i = 0; i < item.quantity; i += 1) {
        twoForOneUnitPrices.push(item.basePriceMxn);
      }
    }
  }

  twoForOneUnitPrices.sort((a, b) => a - b);
  const twoForOneFreeCount = Math.floor(twoForOneUnitPrices.length / 2);
  let twoForOneDiscountMxn = 0;
  for (let i = 0; i < twoForOneFreeCount; i += 1) {
    twoForOneDiscountMxn += twoForOneUnitPrices[i];
  }

  const totalDiscountMxn = twoForOneDiscountMxn;
  const totalMxn = Math.max(0, subtotalMxn - totalDiscountMxn);

  const labelParts: string[] = [];
  if (twoForOneFreeCount > 0) {
    labelParts.push(
      `Promo 2X1 (${twoForOneFreeCount} ${twoForOneFreeCount === 1 ? 'unidad gratis' : 'unidades gratis'})`
    );
  }
  if (comboSavingsMxn > 0) {
    labelParts.push(`Ahorro incluido en combos (${formatMxn(comboSavingsMxn)})`);
  }

  return {
    itemCount,
    subtotalMxn,
    twoForOneFreeCount,
    twoForOneDiscountMxn,
    comboSavingsMxn,
    totalDiscountMxn,
    discountLabel: labelParts.join(' · ').slice(0, SCHEMA_LIMITS.ORDER_DISCOUNT_LABEL_MAX),
    totalMxn,
    eligible2x1Units: twoForOneUnitPrices.length,
    needsOneMoreFor2x1: twoForOneUnitPrices.length % 2 === 1,
  };
}

export function generateOrderCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `SC-${randomDigits}`;
}

export function fulfillmentLabel(type: FulfillmentType): string {
  if (type === 'dine_in') return 'En Mesa';
  if (type === 'pickup') return 'Para Llevar';
  return 'A Domicilio';
}

export function formatWhatsAppTicket(params: {
  restaurantName: string;
  orderCode?: string;
  customerName: string;
  fulfillmentType: FulfillmentType;
  tableOrAddress: string;
  notes?: string;
  items: OrderLineItem[];
  subtotalMxn: number;
  discountMxn: number;
  discountLabel?: string;
  totalMxn: number;
}): string {
  const lines: string[] = [];
  lines.push(`*${params.restaurantName.toUpperCase()}*`);
  if (params.orderCode) {
    lines.push(`Folio: *${params.orderCode}*`);
  }
  lines.push(`Cliente: ${params.customerName || 'Invitado'}`);
  lines.push(
    `Entrega: ${fulfillmentLabel(params.fulfillmentType)} (${params.tableOrAddress || 'Por confirmar'})`
  );
  lines.push('------------------------------');

  for (const item of params.items) {
    lines.push(`${item.quantity}x ${item.name} — ${formatMxn(item.lineTotalMxn)}`);
    if (item.removedIngredients.length > 0) {
      lines.push(`   Sin: ${item.removedIngredients.join(', ')}`);
    }
    if (item.selectedExtras.length > 0) {
      const extrasStr = item.selectedExtras
        .map((e) => `${e.quantity}x ${e.name} (+$${e.priceMxn * e.quantity})`)
        .join(', ');
      lines.push(`   Extras: ${extrasStr}`);
    }
  }

  lines.push('------------------------------');
  lines.push(`Subtotal: ${formatMxn(params.subtotalMxn)}`);
  if (params.discountMxn > 0) {
    lines.push(
      `Descuento${params.discountLabel ? ` (${params.discountLabel})` : ''}: -${formatMxn(params.discountMxn)}`
    );
  }
  lines.push(`*TOTAL A PAGAR: ${formatMxn(params.totalMxn)}*`);

  if (params.notes && params.notes.trim().length > 0) {
    lines.push(`Notas: ${params.notes.trim()}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, '');
  const safeNumber = digitsOnly.length >= 10 ? digitsOnly : '5215512345678';
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
}

export function cartToOrderLineItems(cart: CartItem[]): OrderLineItem[] {
  return cart.slice(0, SCHEMA_LIMITS.ORDER_ITEMS_MAX).map((item) => ({
    menuItemId: item.menuItemId,
    name: item.name.slice(0, SCHEMA_LIMITS.MENU_NAME_MAX),
    quantity: item.quantity,
    basePriceMxn: item.basePriceMxn,
    unitPriceMxn: item.unitPriceMxn,
    lineTotalMxn: item.unitPriceMxn * item.quantity,
    promoType: item.promoType,
    removedIngredients: item.removedIngredients.slice(0, SCHEMA_LIMITS.MENU_INGREDIENTS_MAX),
    selectedExtras: item.selectedExtras.slice(0, SCHEMA_LIMITS.MENU_EXTRAS_MAX),
  }));
}

export function orderToWhatsAppUrl(order: Order, restaurantName: string, whatsappNumber: string): string {
  const ticket = formatWhatsAppTicket({
    restaurantName,
    orderCode: order.orderCode,
    customerName: order.customerName,
    fulfillmentType: order.fulfillmentType,
    tableOrAddress: order.tableOrAddress,
    notes: order.notes,
    items: order.items,
    subtotalMxn: order.subtotalMxn,
    discountMxn: order.discountMxn,
    discountLabel: order.discountLabel,
    totalMxn: order.totalMxn,
  });
  return buildWhatsAppUrl(whatsappNumber, ticket);
}
