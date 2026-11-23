export type MenuCategory =
  | 'burgers'
  | 'burgers_papas'
  | 'combos'
  | 'sandwiches'
  | 'papas_especiales'
  | 'papas_fritas'
  | 'bebidas';

export type PromoType = 'none' | '2x1' | 'combo' | 'favorite';

export type FulfillmentType = 'dine_in' | 'pickup' | 'delivery';

export type OrderStatus =
  | 'received'
  | 'crafting'
  | 'grill'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface ExtraOption {
  id: string;
  name: string;
  priceMxn: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  priceMxn: number;
  originalPriceMxn?: number;
  imageUrl: string;
  promoType: PromoType;
  available: boolean;
  featured: boolean;
  caloriesLabel: string;
  defaultIngredients: string[];
  extraOptions: ExtraOption[];
  sortOrder: number;
}

export interface SelectedExtra {
  id: string;
  name: string;
  priceMxn: number;
  quantity: number;
}

export interface CartItem {
  cartKey: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  basePriceMxn: number;
  originalPriceMxn?: number;
  promoType: PromoType;
  quantity: number;
  removedIngredients: string[];
  selectedExtras: SelectedExtra[];
  unitPriceMxn: number;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  quantity: number;
  basePriceMxn: number;
  unitPriceMxn: number;
  lineTotalMxn: number;
  promoType: PromoType;
  removedIngredients: string[];
  selectedExtras: SelectedExtra[];
}

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  fulfillmentType: FulfillmentType;
  tableOrAddress: string;
  notes: string;
  items: OrderLineItem[];
  subtotalMxn: number;
  discountMxn: number;
  discountLabel: string;
  totalMxn: number;
  status: OrderStatus;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface StorefrontSettings {
  restaurantName: string;
  whatsappNumber: string;
  promoBannerText: string;
  promoActive: boolean;
  isOpen: boolean;
  prepTimeEstimate: string;
}

export type AppView = 'menu' | 'tracker' | 'kitchen';

/**
 * Validation constants synchronized verbatim with firebase-blueprint.json & firestore.rules
 */
export const SCHEMA_LIMITS = {
  MENU_NAME_MIN: 2,
  MENU_NAME_MAX: 80,
  MENU_DESC_MIN: 4,
  MENU_DESC_MAX: 260,
  MENU_PRICE_MAX: 5000,
  MENU_IMAGE_MAX: 500,
  MENU_CALORIES_MAX: 40,
  MENU_INGREDIENTS_MAX: 12,
  MENU_EXTRAS_MAX: 12,
  ORDER_CODE_PATTERN: /^SC-[0-9]{4}$/,
  ORDER_CUSTOMER_NAME_MIN: 2,
  ORDER_CUSTOMER_NAME_MAX: 80,
  ORDER_ADDRESS_MIN: 1,
  ORDER_ADDRESS_MAX: 180,
  ORDER_NOTES_MAX: 240,
  ORDER_ITEMS_MAX: 25,
  ORDER_DISCOUNT_LABEL_MAX: 120,
  SETTINGS_NAME_MIN: 2,
  SETTINGS_NAME_MAX: 80,
  SETTINGS_WHATSAPP_PATTERN: /^[0-9]{10,15}$/,
  SETTINGS_BANNER_MAX: 180,
  SETTINGS_PREP_MAX: 40,
} as const;
