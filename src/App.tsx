import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, db, googleProvider } from './firebase';
import { DEFAULT_STOREFRONT_SETTINGS, SEED_MENU_ITEMS, STORE_INFO } from './data/seedMenu';
import { handleFirestoreError, OperationType } from './lib/firestoreErrors';
import {
  buildCartKey,
  calculateCartPricing,
  cartToOrderLineItems,
  generateOrderCode,
} from './lib/pricing';
import {
  AppView,
  CartItem,
  FulfillmentType,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  SCHEMA_LIMITS,
  SelectedExtra,
  StorefrontSettings,
} from './types/menu';
import { Navbar } from './components/Navbar';
import { MenuView } from './components/MenuView';
import { CraftingModal } from './components/CraftingModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerView } from './components/OrderTrackerView';
import { KitchenAdminView } from './components/KitchenAdminView';
import { RadioactiveBucketsOverlay } from './components/RadioactiveBucketsOverlay';

const CART_STORAGE_KEY = 'slime_craft_cart_v1';

function timestampToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'seconds' in val) {
    const sec = Number((val as { seconds: number }).seconds);
    return Number.isFinite(sec) ? sec * 1000 : Date.now();
  }
  return Date.now();
}

function slugifyId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'item'}-${suffix}`;
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('menu');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all' | 'promo_2x1'>('all');

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [firestoreMenu, setFirestoreMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [settings, setSettings] = useState<StorefrontSettings>(DEFAULT_STOREFRONT_SETTINGS);

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as CartItem[];
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  const [craftingItem, setCraftingItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  // Auth Listener & Admin Role Resolution
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      if (nextUser.emailVerified && nextUser.email === BOOTSTRAPPED_ADMIN_EMAIL) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Public Menu Stream (menuItems)
  useEffect(() => {
    const path = 'menuItems';
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const loaded: MenuItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name || ''),
            category: (data.category as MenuCategory) || 'burgers',
            description: String(data.description || ''),
            priceMxn: Number(data.priceMxn || 0),
            originalPriceMxn: data.originalPriceMxn ? Number(data.originalPriceMxn) : undefined,
            imageUrl: String(data.imageUrl || ''),
            promoType: data.promoType || 'none',
            available: Boolean(data.available),
            featured: Boolean(data.featured),
            caloriesLabel: String(data.caloriesLabel || ''),
            defaultIngredients: Array.isArray(data.defaultIngredients)
              ? data.defaultIngredients.map(String)
              : [],
            extraOptions: Array.isArray(data.extraOptions) ? data.extraOptions : [],
            sortOrder: Number(data.sortOrder || 0),
          };
        });
        loaded.sort((a, b) => a.sortOrder - b.sortOrder);
        setFirestoreMenu(loaded);
        setLoadingMenu(false);
      },
      (error) => {
        setLoadingMenu(false);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, []);

  // Public Storefront Settings Stream (settings/storefront)
  useEffect(() => {
    const path = 'settings/storefront';
    const unsub = onSnapshot(
      doc(db, 'settings', 'storefront'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            restaurantName: String(data.restaurantName || DEFAULT_STOREFRONT_SETTINGS.restaurantName),
            whatsappNumber: String(data.whatsappNumber || DEFAULT_STOREFRONT_SETTINGS.whatsappNumber),
            promoBannerText: String(
              data.promoBannerText ?? DEFAULT_STOREFRONT_SETTINGS.promoBannerText
            ),
            promoActive: Boolean(data.promoActive),
            isOpen: Boolean(data.isOpen),
            prepTimeEstimate: String(
              data.prepTimeEstimate || DEFAULT_STOREFRONT_SETTINGS.prepTimeEstimate
            ),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, []);

  // Authenticated Customer Live Orders Stream
  useEffect(() => {
    if (!authReady || !user) {
      setCustomerOrders([]);
      return;
    }

    const path = 'orders';
    const q = query(collection(db, path), where('customerId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            orderCode: String(data.orderCode || ''),
            customerId: String(data.customerId || ''),
            customerName: String(data.customerName || ''),
            fulfillmentType: (data.fulfillmentType as FulfillmentType) || 'dine_in',
            tableOrAddress: String(data.tableOrAddress || ''),
            notes: String(data.notes || ''),
            items: Array.isArray(data.items) ? data.items : [],
            subtotalMxn: Number(data.subtotalMxn || 0),
            discountMxn: Number(data.discountMxn || 0),
            discountLabel: String(data.discountLabel || ''),
            totalMxn: Number(data.totalMxn || 0),
            status: (data.status as OrderStatus) || 'received',
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setCustomerOrders(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [authReady, user]);

  // Authenticated Kitchen/Admin Live Orders Stream (all orders)
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setKitchenOrders([]);
      return;
    }

    const path = 'orders';
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: Order[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            orderCode: String(data.orderCode || ''),
            customerId: String(data.customerId || ''),
            customerName: String(data.customerName || ''),
            fulfillmentType: (data.fulfillmentType as FulfillmentType) || 'dine_in',
            tableOrAddress: String(data.tableOrAddress || ''),
            notes: String(data.notes || ''),
            items: Array.isArray(data.items) ? data.items : [],
            subtotalMxn: Number(data.subtotalMxn || 0),
            discountMxn: Number(data.discountMxn || 0),
            discountLabel: String(data.discountLabel || ''),
            totalMxn: Number(data.totalMxn || 0),
            status: (data.status as OrderStatus) || 'received',
            createdAtMs: timestampToMs(data.createdAt),
            updatedAtMs: timestampToMs(data.updatedAt),
          };
        });
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setKitchenOrders(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsub();
  }, [authReady, user, isAdmin]);

  // Resilient Menu Display: uses live Firestore catalog if populated, falls back to seed catalog until admin syncs
  const menuItems = useMemo(
    () => (firestoreMenu.length > 0 ? firestoreMenu : SEED_MENU_ITEMS),
    [firestoreMenu]
  );

  const pricing = useMemo(() => calculateCartPricing(cart), [cart]);

  const hasActiveOrder = useMemo(
    () => customerOrders.some((o) => !['delivered', 'cancelled'].includes(o.status)),
    [customerOrders]
  );

  // Auth Actions
  const handleSignIn = useCallback(async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Sesión iniciada como ${result.user.displayName || result.user.email}`);
      return result.user;
    } catch {
      return null;
    }
  }, [showToast]);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    showToast('Sesión cerrada.');
  }, [showToast]);

  // Cart Actions
  const addConfiguredItemToCart = useCallback(
    (params: {
      item: MenuItem;
      quantity: number;
      removedIngredients: string[];
      selectedExtras: SelectedExtra[];
    }) => {
      const { item, quantity, removedIngredients, selectedExtras } = params;
      const extrasUnit = selectedExtras.reduce((sum, e) => sum + e.priceMxn * e.quantity, 0);
      const unitPriceMxn = item.priceMxn + extrasUnit;
      const cartKey = buildCartKey(item.id, removedIngredients, selectedExtras);

      setCart((prev) => {
        const existing = prev.find((c) => c.cartKey === cartKey);
        if (existing) {
          return prev.map((c) =>
            c.cartKey === cartKey ? { ...c, quantity: Math.min(20, c.quantity + quantity) } : c
          );
        }
        return [
          ...prev,
          {
            cartKey,
            menuItemId: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            basePriceMxn: item.priceMxn,
            originalPriceMxn: item.originalPriceMxn,
            promoType: item.promoType,
            quantity,
            removedIngredients,
            selectedExtras,
            unitPriceMxn,
          },
        ];
      });
      showToast(`Agregado: ${item.name}`);
    },
    [showToast]
  );

  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      addConfiguredItemToCart({
        item,
        quantity: 1,
        removedIngredients: [],
        selectedExtras: [],
      });
    },
    [addConfiguredItemToCart]
  );

  const handleUpdateCartQuantity = useCallback((cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const handleRemoveCartItem = useCallback((cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  }, []);

  // Firestore Order Creation
  const handlePlaceOrder = useCallback(
    async (details: {
      customerName: string;
      fulfillmentType: FulfillmentType;
      tableOrAddress: string;
      notes: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Debes iniciar sesión con Google para confirmar tu pedido.');
      }

      const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const orderCode = generateOrderCode();
      const lineItems = cartToOrderLineItems(cart);
      const summary = calculateCartPricing(cart);
      const path = `orders/${orderId}`;

      try {
        await setDoc(doc(db, 'orders', orderId), {
          orderCode,
          customerId: currentUser.uid,
          customerName: details.customerName.slice(0, SCHEMA_LIMITS.ORDER_CUSTOMER_NAME_MAX),
          fulfillmentType: details.fulfillmentType,
          tableOrAddress: details.tableOrAddress.slice(0, SCHEMA_LIMITS.ORDER_ADDRESS_MAX),
          notes: details.notes.slice(0, SCHEMA_LIMITS.ORDER_NOTES_MAX),
          items: lineItems,
          subtotalMxn: summary.subtotalMxn,
          discountMxn: summary.totalDiscountMxn,
          discountLabel: summary.discountLabel.slice(0, SCHEMA_LIMITS.ORDER_DISCOUNT_LABEL_MAX),
          totalMxn: summary.totalMxn,
          status: 'received',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setCart([]);
        setCartOpen(false);
        setActiveOrderId(orderId);
        setActiveView('tracker');
        showToast(`Pedido ${orderCode} enviado a cocina`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [cart, showToast]
  );

  // Customer Cancel Order (only allowed when status === 'received')
  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      const path = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        });
        showToast('Pedido cancelado.');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [showToast]
  );

  // Admin Kitchen Status Update
  const handleUpdateOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const path = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
        showToast(`Comanda actualizada a: ${nextStatus}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [showToast]
  );

  // Admin Seed / Sync Official 34-Item Cianuro Burger BL Catalog + Storefront Settings
  const handleSeedCatalog = useCallback(async () => {
    const path = 'menuItems';
    try {
      const batch = writeBatch(db);
      const validIds = new Set(SEED_MENU_ITEMS.map((i) => i.id));
      const existingIds = new Set(firestoreMenu.map((m) => m.id));

      for (const existing of firestoreMenu) {
        if (!validIds.has(existing.id)) {
          batch.delete(doc(db, 'menuItems', existing.id));
        }
      }

      for (const item of SEED_MENU_ITEMS) {
        const updatePayload: Record<string, unknown> = {
          name: item.name,
          category: item.category,
          description: item.description,
          priceMxn: item.priceMxn,
          imageUrl: item.imageUrl,
          promoType: item.promoType,
          available: item.available,
          featured: item.featured,
          caloriesLabel: item.caloriesLabel,
          defaultIngredients: item.defaultIngredients,
          extraOptions: item.extraOptions,
          sortOrder: item.sortOrder,
          updatedAt: serverTimestamp(),
        };
        if (item.originalPriceMxn !== undefined) {
          updatePayload.originalPriceMxn = item.originalPriceMxn;
        }

        if (existingIds.has(item.id)) {
          batch.update(doc(db, 'menuItems', item.id), updatePayload);
        } else {
          batch.set(doc(db, 'menuItems', item.id), {
            ...updatePayload,
            createdAt: serverTimestamp(),
          });
        }
      }

      batch.set(doc(db, 'settings', 'storefront'), {
        ...DEFAULT_STOREFRONT_SETTINGS,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      showToast(`Menú oficial de Cianuro Burger BL (${SEED_MENU_ITEMS.length} platillos) sincronizado.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, [firestoreMenu, showToast]);

  // Admin Create / Update Menu Item
  const handleSaveMenuItem = useCallback(
    async (item: Omit<MenuItem, 'id'>, existingId?: string) => {
      const isExistingInFirestore =
        Boolean(existingId) && firestoreMenu.some((m) => m.id === existingId);
      const docId = existingId || slugifyId(item.name);
      const path = `menuItems/${docId}`;

      const basePayload: Record<string, unknown> = {
        name: item.name.slice(0, SCHEMA_LIMITS.MENU_NAME_MAX),
        category: item.category,
        description: item.description.slice(0, SCHEMA_LIMITS.MENU_DESC_MAX),
        priceMxn: item.priceMxn,
        imageUrl: item.imageUrl.slice(0, SCHEMA_LIMITS.MENU_IMAGE_MAX),
        promoType: item.promoType,
        available: item.available,
        featured: item.featured,
        caloriesLabel: item.caloriesLabel.slice(0, SCHEMA_LIMITS.MENU_CALORIES_MAX),
        defaultIngredients: item.defaultIngredients.slice(0, SCHEMA_LIMITS.MENU_INGREDIENTS_MAX),
        extraOptions: item.extraOptions.slice(0, SCHEMA_LIMITS.MENU_EXTRAS_MAX),
        sortOrder: item.sortOrder,
        updatedAt: serverTimestamp(),
      };
      if (item.originalPriceMxn !== undefined) {
        basePayload.originalPriceMxn = item.originalPriceMxn;
      }

      try {
        if (isExistingInFirestore) {
          await updateDoc(doc(db, 'menuItems', docId), basePayload);
          showToast(`Platillo actualizado: ${item.name}`);
        } else {
          await setDoc(doc(db, 'menuItems', docId), {
            ...basePayload,
            createdAt: serverTimestamp(),
          });
          showToast(`Platillo guardado: ${item.name}`);
        }
      } catch (error) {
        handleFirestoreError(
          error,
          isExistingInFirestore ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      }
    },
    [firestoreMenu, showToast]
  );

  // Admin Toggle Availability
  const handleToggleAvailability = useCallback(
    async (item: MenuItem) => {
      const isInFirestore = firestoreMenu.some((m) => m.id === item.id);
      const path = `menuItems/${item.id}`;
      try {
        if (isInFirestore) {
          await updateDoc(doc(db, 'menuItems', item.id), {
            available: !item.available,
            updatedAt: serverTimestamp(),
          });
        } else {
          const payload: Record<string, unknown> = {
            name: item.name,
            category: item.category,
            description: item.description,
            priceMxn: item.priceMxn,
            imageUrl: item.imageUrl,
            promoType: item.promoType,
            available: !item.available,
            featured: item.featured,
            caloriesLabel: item.caloriesLabel,
            defaultIngredients: item.defaultIngredients,
            extraOptions: item.extraOptions,
            sortOrder: item.sortOrder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (item.originalPriceMxn !== undefined) {
            payload.originalPriceMxn = item.originalPriceMxn;
          }
          await setDoc(doc(db, 'menuItems', item.id), payload);
        }
        showToast(
          !item.available ? `${item.name} marcado Disponible` : `${item.name} marcado Agotado`
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [firestoreMenu, showToast]
  );

  // Admin Delete Menu Item
  const handleDeleteMenuItem = useCallback(
    async (itemId: string) => {
      const path = `menuItems/${itemId}`;
      try {
        await deleteDoc(doc(db, 'menuItems', itemId));
        showToast('Platillo eliminado del catálogo.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [showToast]
  );

  // Admin Save Storefront Settings
  const handleSaveSettings = useCallback(
    async (next: StorefrontSettings) => {
      const path = 'settings/storefront';
      try {
        await setDoc(doc(db, 'settings', 'storefront'), {
          restaurantName: next.restaurantName.slice(0, SCHEMA_LIMITS.SETTINGS_NAME_MAX),
          whatsappNumber: next.whatsappNumber,
          promoBannerText: next.promoBannerText.slice(0, SCHEMA_LIMITS.SETTINGS_BANNER_MAX),
          promoActive: next.promoActive,
          isOpen: next.isOpen,
          prepTimeEstimate: next.prepTimeEstimate.slice(0, SCHEMA_LIMITS.SETTINGS_PREP_MAX),
          updatedAt: serverTimestamp(),
        });
        showToast('Configuración del local actualizada.');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [showToast]
  );

  return (
    <div className="min-h-screen mc-bg-grid text-[#E4E1E6] flex flex-col relative">
      {/* Top-left & Top-right Minecraft Buckets pouring radioactive liquid */}
      <RadioactiveBucketsOverlay />

      <Navbar
        restaurantName={settings.restaurantName}
        activeView={activeView}
        activeCategory={activeCategory}
        onSelectView={(v) => {
          setActiveView(v);
          if (v === 'menu' && activeCategory === 'promo_2x1') {
            setActiveCategory('all');
          }
        }}
        onSelectPromos={() => {
          setActiveView('menu');
          setActiveCategory('promo_2x1');
        }}
        cartCount={pricing.itemCount}
        cartTotalMxn={pricing.totalMxn}
        onOpenCart={() => setCartOpen(true)}
        hasActiveOrder={hasActiveOrder}
      />

      <main className="flex-1">
        {activeView === 'menu' && (
          <MenuView
            items={menuItems}
            settings={settings}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onQuickAdd={handleQuickAdd}
            onOpenCraft={setCraftingItem}
            loadingMenu={loadingMenu}
          />
        )}

        {activeView === 'tracker' && (
          <OrderTrackerView
            user={user}
            orders={customerOrders}
            activeOrderId={activeOrderId}
            onSelectOrder={setActiveOrderId}
            onCancelOrder={handleCancelOrder}
            onSignIn={handleSignIn}
            onGoToMenu={() => setActiveView('menu')}
            settings={settings}
          />
        )}

        {activeView === 'kitchen' && (
          <KitchenAdminView
            user={user}
            isAdmin={isAdmin}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            orders={kitchenOrders}
            menuItems={menuItems}
            firestoreMenuCount={firestoreMenu.length}
            settings={settings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSeedCatalog={handleSeedCatalog}
            onSaveMenuItem={handleSaveMenuItem}
            onToggleAvailability={handleToggleAvailability}
            onDeleteMenuItem={handleDeleteMenuItem}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Cianuro Burger BL Footer */}
      <footer className="border-t-2 border-[#262933] bg-[#0A0B0E] py-10 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-[#869585]">
          <div className="space-y-2">
            <p className="font-pixel text-sm font-bold text-[#4BE277]">
              {settings.restaurantName}
            </p>
            <p className="leading-relaxed text-[#BCCBB9]">
              Smash burgers artesanales con estética Minecraft radioactiva, brioche dorado y promos
              2X1 automáticas.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-display font-bold text-[#4BE277] uppercase">Horarios y Sede</p>
            <p className="text-[#BCCBB9]">{STORE_INFO.address}</p>
            <p>{STORE_INFO.hours}</p>
          </div>

          <div className="space-y-1.5">
            <p className="font-display font-bold text-[#4BE277] uppercase">Servicio Delivery</p>
            <p className="text-[#BCCBB9]">
              Envío gratis a partir de ${STORE_INFO.freeDeliveryMinMxn} MXN.
            </p>
            <p>Tiempo promedio de preparación: {settings.prepTimeEstimate}.</p>
          </div>

          <div className="space-y-1.5">
            <p className="font-display font-bold text-[#4BE277] uppercase">Accesos Rápidos</p>
            <div className="flex flex-col items-start gap-1.5">
              <button
                type="button"
                onClick={() => setActiveView('tracker')}
                className="text-[#BCCBB9] hover:text-[#4BE277] transition-colors cursor-pointer"
              >
                Rastrear mi pedido en vivo
              </button>
              <button
                type="button"
                onClick={() => setActiveView('kitchen')}
                className="text-[#BCCBB9] hover:text-[#FACC15] transition-colors cursor-pointer"
              >
                Panel de Cocina y Editor
              </button>
              <span>Precios en MXN con IVA incluido</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Crafting Table Modal */}
      <CraftingModal
        item={craftingItem}
        onClose={() => setCraftingItem(null)}
        onConfirmAdd={addConfiguredItemToCart}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        settings={settings}
        user={user}
        onSignIn={handleSignIn}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onGoToPromos={() => {
          setActiveView('menu');
          setActiveCategory('promo_2x1');
        }}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Lightweight Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded bg-[#18181B] border border-[#22C55E] text-[#E4E1E6] font-display text-xs font-bold slime-glow whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
