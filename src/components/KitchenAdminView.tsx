import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChefHat,
  Database,
  Edit3,
  LogIn,
  LogOut,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CATEGORY_META, STUDIO_IMAGE_OPTIONS, STUDIO_IMAGES } from '../data/seedMenu';
import { formatMxn, fulfillmentLabel } from '../lib/pricing';
import {
  ExtraOption,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  PromoType,
  SCHEMA_LIMITS,
  StorefrontSettings,
} from '../types/menu';
import { DishImage } from './DishImage';

interface KitchenAdminViewProps {
  user: User | null;
  isAdmin: boolean;
  onSignIn: () => Promise<User | null>;
  onSignOut: () => Promise<void>;
  orders: Order[];
  menuItems: MenuItem[];
  firestoreMenuCount: number;
  settings: StorefrontSettings;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onSeedCatalog: () => Promise<void>;
  onSaveMenuItem: (item: Omit<MenuItem, 'id'>, existingId?: string) => Promise<void>;
  onToggleAvailability: (item: MenuItem) => Promise<void>;
  onDeleteMenuItem: (itemId: string) => Promise<void>;
  onSaveSettings: (settings: StorefrontSettings) => Promise<void>;
}

type AdminTab = 'kds' | 'menu' | 'settings';

const STATUS_TRANSITION: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  received: { next: 'crafting', label: 'Iniciar Crafteo' },
  crafting: { next: 'grill', label: 'Pasar a Plancha' },
  grill: { next: 'ready', label: 'Marcar Listo' },
  ready: { next: 'delivered', label: 'Marcar Entregado' },
  delivered: null,
  cancelled: null,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recibido',
  crafting: 'En Crafteo',
  grill: 'En Plancha',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

function elapsedLabel(createdAtMs: number): string {
  if (!createdAtMs) return 'Ahora';
  const mins = Math.max(0, Math.floor((Date.now() - createdAtMs) / 60000));
  if (mins < 1) return '< 1 min';
  return `${mins} min`;
}

export function KitchenAdminView({
  user,
  isAdmin,
  onSignIn,
  onSignOut,
  orders,
  menuItems,
  firestoreMenuCount,
  settings,
  onUpdateOrderStatus,
  onSeedCatalog,
  onSaveMenuItem,
  onToggleAvailability,
  onDeleteMenuItem,
  onSaveSettings,
}: KitchenAdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('kds');
  const [kdsFilter, setKdsFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Menu Editor Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('burgers');
  const [description, setDescription] = useState('');
  const [priceMxn, setPriceMxn] = useState('165');
  const [originalPriceMxn, setOriginalPriceMxn] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(STUDIO_IMAGES.heroSmash);
  const [promoType, setPromoType] = useState<PromoType>('none');
  const [caloriesLabel, setCaloriesLabel] = useState('Doble 180g');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [ingredientsText, setIngredientsText] = useState(
    'Salsa Slime, Queso cheddar, Pepinillos, Cebolla morada'
  );
  const [extrasText, setExtrasText] = useState(
    'Carne Smash Extra:48\nTocino Ahumado:32\nDoble Cheddar:24'
  );
  const [savingItem, setSavingItem] = useState(false);
  const [itemFormError, setItemFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Storefront Settings Form State
  const [storeName, setStoreName] = useState(settings.restaurantName);
  const [whatsappNum, setWhatsappNum] = useState(settings.whatsappNumber);
  const [promoBanner, setPromoBanner] = useState(settings.promoBannerText);
  const [promoActive, setPromoActive] = useState(settings.promoActive);
  const [isOpen, setIsOpen] = useState(settings.isOpen);
  const [prepEstimate, setPrepEstimate] = useState(settings.prepTimeEstimate);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    setStoreName(settings.restaurantName);
    setWhatsappNum(settings.whatsappNumber);
    setPromoBanner(settings.promoBannerText);
    setPromoActive(settings.promoActive);
    setIsOpen(settings.isOpen);
    setPrepEstimate(settings.prepTimeEstimate);
  }, [settings]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (kdsFilter === 'active') return !['delivered', 'cancelled'].includes(o.status);
      if (kdsFilter === 'completed') return ['delivered', 'cancelled'].includes(o.status);
      return true;
    });
  }, [orders, kdsFilter]);

  const activeOrdersCount = useMemo(
    () => orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
    [orders]
  );

  // Auth / Role Gate
  if (!user) {
    return (
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-14">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-8 md:p-10 text-center space-y-5 voxel-bevel">
          <div className="w-14 h-14 mx-auto rounded-lg bg-[#131316] border border-[#27272A] flex items-center justify-center text-[#FACC15]">
            <ChefHat className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold text-[#E4E1E6]">
              Panel de Cocina y Editor de Menú
            </h1>
            <p className="text-sm text-[#BCCBB9] leading-relaxed">
              Inicia sesión con tu cuenta autorizada de Google para gestionar comandas en vivo,
              actualizar precios MXN, promociones 2X1 y disponibilidad del menú.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSignIn()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] slime-glow transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Entrar con Google
          </button>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-14">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-8 md:p-10 text-center space-y-5 voxel-bevel">
          <div className="w-14 h-14 mx-auto rounded-lg bg-[#93000A]/30 border border-[#EF4444]/60 flex items-center justify-center text-[#EF4444]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold text-[#E4E1E6]">
              Acceso restringido a operadores
            </h1>
            <p className="text-sm text-[#BCCBB9] leading-relaxed">
              Has iniciado sesión como <strong className="text-[#E4E1E6]">{user.email}</strong>. El
              tablero de cocina y el editor de menú requieren permisos de administrador del
              restaurante.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#131316] border border-[#27272A] hover:border-[#EF4444] text-[#E4E1E6] font-display font-bold text-sm rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cambiar cuenta
          </button>
        </div>
      </section>
    );
  }

  const openNewItemForm = () => {
    setEditingId(null);
    setName('');
    setCategory('burgers');
    setDescription('');
    setPriceMxn('175');
    setOriginalPriceMxn('');
    setImageUrl(STUDIO_IMAGES.heroSmash);
    setPromoType('none');
    setCaloriesLabel('Doble 180g');
    setAvailable(true);
    setFeatured(false);
    setIngredientsText('Salsa Slime, Queso cheddar, Pepinillos, Cebolla morada');
    setExtrasText('Carne Smash Extra:48\nTocino Ahumado:32\nDoble Cheddar:24');
    setItemFormError('');
    setShowItemForm(true);
  };

  const openEditItemForm = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setDescription(item.description);
    setPriceMxn(String(item.priceMxn));
    setOriginalPriceMxn(item.originalPriceMxn ? String(item.originalPriceMxn) : '');
    setImageUrl(item.imageUrl);
    setPromoType(item.promoType);
    setCaloriesLabel(item.caloriesLabel);
    setAvailable(item.available);
    setFeatured(item.featured);
    setIngredientsText(item.defaultIngredients.join(', '));
    setExtrasText(item.extraOptions.map((e) => `${e.name}:${e.priceMxn}`).join('\n'));
    setItemFormError('');
    setShowItemForm(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError('');

    const cleanName = name.trim().slice(0, SCHEMA_LIMITS.MENU_NAME_MAX);
    const cleanDesc = description.trim().slice(0, SCHEMA_LIMITS.MENU_DESC_MAX);
    const parsedPrice = Number(priceMxn);
    const parsedOrig = originalPriceMxn.trim() ? Number(originalPriceMxn) : undefined;

    if (cleanName.length < SCHEMA_LIMITS.MENU_NAME_MIN) {
      setItemFormError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (cleanDesc.length < SCHEMA_LIMITS.MENU_DESC_MIN) {
      setItemFormError('La descripción debe tener al menos 4 caracteres.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || parsedPrice > SCHEMA_LIMITS.MENU_PRICE_MAX) {
      setItemFormError('Ingresa un precio válido en MXN (mayor a 0 y menor o igual a 5000).');
      return;
    }

    const defaultIngredients = ingredientsText
      .split(',')
      .map((s) => s.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, SCHEMA_LIMITS.MENU_INGREDIENTS_MAX);

    const extraOptions: ExtraOption[] = extrasText
      .split('\n')
      .map((line, idx) => {
        const [rawLabel, rawPrice] = line.split(':');
        const label = (rawLabel || '').trim().slice(0, 60);
        const price = Number((rawPrice || '0').trim());
        if (!label) return null;
        return {
          id: `ext_${idx}_${label.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || idx}`,
          name: label,
          priceMxn: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
        };
      })
      .filter((x): x is ExtraOption => x !== null)
      .slice(0, SCHEMA_LIMITS.MENU_EXTRAS_MAX);

    setSavingItem(true);
    try {
      await onSaveMenuItem(
        {
          name: cleanName,
          category,
          description: cleanDesc,
          priceMxn: Math.round(parsedPrice),
          ...(parsedOrig && Number.isFinite(parsedOrig) && parsedOrig > 0
            ? { originalPriceMxn: Math.round(parsedOrig) }
            : {}),
          imageUrl: imageUrl.trim().slice(0, SCHEMA_LIMITS.MENU_IMAGE_MAX) || STUDIO_IMAGES.heroSmash,
          promoType,
          available,
          featured,
          caloriesLabel: caloriesLabel.trim().slice(0, SCHEMA_LIMITS.MENU_CALORIES_MAX),
          defaultIngredients,
          extraOptions,
          sortOrder: editingId
            ? menuItems.find((m) => m.id === editingId)?.sortOrder ?? menuItems.length + 1
            : menuItems.length + 1,
        },
        editingId || undefined
      );
      setShowItemForm(false);
      setEditingId(null);
    } catch (err) {
      setItemFormError(err instanceof Error ? err.message : 'No se pudo guardar el platillo.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg('');
    const cleanPhone = whatsappNum.replace(/[^0-9]/g, '');
    if (!SCHEMA_LIMITS.SETTINGS_WHATSAPP_PATTERN.test(cleanPhone)) {
      setSettingsMsg('El WhatsApp debe contener entre 10 y 15 dígitos numéricos (ej. 5215512345678).');
      return;
    }
    setSavingSettings(true);
    try {
      await onSaveSettings({
        restaurantName:
          storeName.trim().slice(0, SCHEMA_LIMITS.SETTINGS_NAME_MAX) || 'Slime Craft Burgers',
        whatsappNumber: cleanPhone,
        promoBannerText: promoBanner.trim().slice(0, SCHEMA_LIMITS.SETTINGS_BANNER_MAX),
        promoActive,
        isOpen,
        prepTimeEstimate: prepEstimate.trim().slice(0, SCHEMA_LIMITS.SETTINGS_PREP_MAX) || '15–20 min',
      });
      setSettingsMsg('Configuración guardada y sincronizada en vivo.');
    } catch (err) {
      setSettingsMsg(err instanceof Error ? err.message : 'Error al guardar configuración.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, status: OrderStatus) => {
    setBusyOrderId(orderId);
    try {
      await onUpdateOrderStatus(orderId, status);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeedCatalog();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-10 space-y-8">
      {/* Workspace Header & Tab Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
        <div>
          <p className="text-xs font-display font-bold text-[#FACC15]">
            Operador: {user.email}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#E4E1E6] mt-1">
            Centro de Cocina y Menú
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center p-1 bg-[#18181B] border border-[#27272A] rounded">
            <button
              type="button"
              onClick={() => setActiveTab('kds')}
              className={`px-3.5 py-2 rounded font-display font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'kds'
                  ? 'bg-[#22C55E] text-[#002109]'
                  : 'text-[#BCCBB9] hover:text-[#E4E1E6]'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Comandas ({activeOrdersCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded font-display font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-[#22C55E] text-[#002109]'
                  : 'text-[#BCCBB9] hover:text-[#E4E1E6]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Editor Menú ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded font-display font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#22C55E] text-[#002109]'
                  : 'text-[#BCCBB9] hover:text-[#E4E1E6]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Local & WhatsApp
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            className="px-3 py-2.5 rounded bg-[#18181B] border border-[#27272A] hover:border-[#EF4444] text-[#BCCBB9] hover:text-[#E4E1E6] font-display font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      {/* Prompt to seed or sync official 34-item Cianuro Burger BL catalog in Firestore */}
      {firestoreMenuCount < 30 && (
        <div className="p-4 rounded-lg bg-[#14161C] border-2 border-[#FACC15]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-sm font-bold text-[#E4E1E6]">
                Sincronizar menú oficial de Cianuro Burger BL en Firestore
              </p>
              <p className="text-xs text-[#BCCBB9] mt-0.5">
                Carga los 34 platillos reales de Cianuro Burger BL (Burgers, Con Papas, Combos,
                Sandwiches, Papas Especiales y Bebidas) en tu base de datos con un clic.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="px-4 py-2.5 bg-[#FACC15] text-[#231B00] hover:bg-[#FFE083] font-display font-bold text-xs rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {seeding ? 'Sincronizando menú...' : 'Cargar 34 platillos oficiales'}
          </button>
        </div>
      )}

      {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeTab === 'kds' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'active', label: `Activos (${activeOrdersCount})` },
                  { id: 'completed', label: 'Entregados / Cancelados' },
                  { id: 'all', label: `Todos (${orders.length})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKdsFilter(f.id)}
                  className={`px-3.5 py-2 rounded font-display font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    kdsFilter === f.id
                      ? 'bg-[#27272A] text-[#E4E1E6] border border-[#22C55E]'
                      : 'bg-[#18181B] text-[#BCCBB9] border border-[#27272A]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#4BE277] inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Escuchando comandas en vivo
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-12 text-center space-y-2">
              <p className="font-display text-lg font-bold text-[#E4E1E6]">
                Sin comandas en esta vista
              </p>
              <p className="text-sm text-[#BCCBB9]">
                Los nuevos pedidos que confirmen los clientes aparecerán automáticamente aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const transition = STATUS_TRANSITION[order.status];
                const isBusy = busyOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="bg-[#18181B] border border-[#27272A] rounded-lg voxel-bevel flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Ticket Top Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#27272A]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-lg font-bold text-[#E4E1E6]">
                              {order.orderCode}
                            </span>
                            <span
                              className={`text-xs font-display font-bold px-2 py-0.5 rounded ${
                                order.status === 'received'
                                  ? 'bg-[#FACC15] text-[#231B00]'
                                  : order.status === 'crafting' || order.status === 'grill'
                                  ? 'bg-[#22C55E]/20 text-[#4BE277] border border-[#22C55E]/50'
                                  : order.status === 'ready'
                                  ? 'bg-[#22C55E] text-[#002109]'
                                  : order.status === 'cancelled'
                                  ? 'bg-[#93000A]/50 text-[#FFB4AE]'
                                  : 'bg-[#27272A] text-[#BCCBB9]'
                              }`}
                            >
                              {STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <p className="text-xs text-[#BCCBB9] mt-1">
                            {order.customerName} · {fulfillmentLabel(order.fulfillmentType)} (
                            {order.tableOrAddress})
                          </p>
                        </div>
                        <span className="text-xs font-display font-bold text-[#869585] tabular-nums shrink-0">
                          {elapsedLabel(order.createdAtMs)}
                        </span>
                      </div>

                      {/* Line Items for Kitchen Prep */}
                      <div className="space-y-2.5">
                        {order.items.map((line, i) => (
                          <div
                            key={`${line.menuItemId}-${i}`}
                            className="p-2.5 rounded bg-[#131316] border border-[#27272A] space-y-1"
                          >
                            <p className="text-sm font-medium text-[#E4E1E6]">
                              <span className="font-display font-bold text-[#4BE277] tabular-nums mr-1.5">
                                {line.quantity}x
                              </span>
                              {line.name}
                            </p>
                            {line.removedIngredients.length > 0 && (
                              <p className="text-xs font-medium text-[#EF4444]">
                                SIN: {line.removedIngredients.join(', ')}
                              </p>
                            )}
                            {line.selectedExtras.length > 0 && (
                              <p className="text-xs font-medium text-[#FACC15]">
                                EXTRAS:{' '}
                                {line.selectedExtras
                                  .map((e) => `${e.quantity}x ${e.name}`)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-[#FACC15] bg-[#0D0D11] border border-[#27272A] rounded p-2.5">
                          Nota: {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-[#131316] border-t border-[#27272A] space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#BCCBB9]">
                        <span>{order.discountLabel || 'Total comanda'}</span>
                        <span className="font-sans text-sm font-bold text-[#E4E1E6] tabular-nums">
                          {formatMxn(order.totalMxn)}
                        </span>
                      </div>

                      {transition && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleAdvanceStatus(order.id, transition.next)}
                            className="flex-1 min-h-[44px] px-3 py-2 bg-[#22C55E] hover:bg-[#4BE277] disabled:opacity-50 text-[#002109] font-display font-bold text-xs rounded inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{isBusy ? 'Actualizando...' : transition.label}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleAdvanceStatus(order.id, 'cancelled')}
                            aria-label={`Cancelar pedido ${order.orderCode}`}
                            className="h-11 px-3 rounded border border-[#27272A] hover:border-[#EF4444] text-[#FFB4AE] font-display font-bold text-xs transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU CRUD EDITOR */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#BCCBB9]">
              Los cambios se reflejan al instante en la carta digital de todos los clientes.
            </p>
            <button
              type="button"
              onClick={openNewItemForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] hover:bg-[#4BE277] text-[#002109] font-display font-bold text-sm rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nuevo Platillo
            </button>
          </div>

          {showItemForm && (
            <form
              onSubmit={handleSaveItem}
              className="bg-[#18181B] border border-[#22C55E] rounded-xl p-6 space-y-5 voxel-bevel"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <h2 className="font-display text-lg font-bold text-[#E4E1E6]">
                  {editingId ? 'Editar platillo' : 'Crear nuevo platillo'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="text-[#869585] hover:text-[#E4E1E6] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Nombre del platillo *</label>
                  <input
                    type="text"
                    required
                    maxLength={SCHEMA_LIMITS.MENU_NAME_MAX}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Slime Double Crunch"
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Categoría *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MenuCategory)}
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                  >
                    <option value="burgers">Burgers (Sencillas)</option>
                    <option value="burgers_papas">Burgers con Papas</option>
                    <option value="combos">Combos con Refresco</option>
                    <option value="sandwiches">Sandwiches</option>
                    <option value="papas_especiales">Papas Especiales</option>
                    <option value="papas_fritas">Papas Fritas & Aros</option>
                    <option value="bebidas">Bebidas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Etiqueta / Promoción</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as PromoType)}
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                  >
                    <option value="none">Ninguna</option>
                    <option value="2x1">2X1 (Aplica descuento automático)</option>
                    <option value="favorite">#1 Favorito</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Precio MXN *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={SCHEMA_LIMITS.MENU_PRICE_MAX}
                    value={priceMxn}
                    onChange={(e) => setPriceMxn(e.target.value)}
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">
                    Precio regular tachado (opcional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={SCHEMA_LIMITS.MENU_PRICE_MAX}
                    value={originalPriceMxn}
                    onChange={(e) => setOriginalPriceMxn(e.target.value)}
                    placeholder="Ej. 285"
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Porción / Etiqueta corta</label>
                  <input
                    type="text"
                    maxLength={SCHEMA_LIMITS.MENU_CALORIES_MAX}
                    value={caloriesLabel}
                    onChange={(e) => setCaloriesLabel(e.target.value)}
                    placeholder="Ej. Doble 180g"
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#BCCBB9]">Descripción gastronómica *</label>
                <textarea
                  required
                  rows={2}
                  maxLength={SCHEMA_LIMITS.MENU_DESC_MAX}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe carne, quesos, pan y salsa..."
                  className="w-full p-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">Fotografía del platillo</label>
                  <select
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
                  >
                    {STUDIO_IMAGE_OPTIONS.map((opt) => (
                      <option key={opt.url} value={opt.url}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-6 pb-2">
                  <label className="inline-flex items-center gap-2 text-sm text-[#E4E1E6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvailable(e.target.checked)}
                      className="w-4 h-4 accent-[#22C55E]"
                    />
                    Disponible para venta
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-[#E4E1E6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#FACC15]"
                    />
                    Destacar en portada
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">
                    Ingredientes base removibles (separados por coma)
                  </label>
                  <textarea
                    rows={3}
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    className="w-full p-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-xs text-[#E4E1E6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#BCCBB9]">
                    Extras de mesa de crafteo (uno por línea: Nombre:PrecioMXN)
                  </label>
                  <textarea
                    rows={3}
                    value={extrasText}
                    onChange={(e) => setExtrasText(e.target.value)}
                    className="w-full p-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-xs text-[#E4E1E6] font-mono"
                  />
                </div>
              </div>

              {itemFormError && (
                <p className="text-xs text-[#FFB4AE] bg-[#93000A]/30 border border-[#EF4444]/50 rounded p-2.5">
                  {itemFormError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="px-4 py-2.5 rounded border border-[#27272A] text-sm font-display font-bold text-[#BCCBB9] hover:text-[#E4E1E6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#22C55E] hover:bg-[#4BE277] text-[#002109] font-display font-bold text-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingItem ? 'Guardando...' : 'Guardar Platillo'}
                </button>
              </div>
            </form>
          )}

          {/* Inventory Menu Table */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#131316] border-b border-[#27272A] text-xs font-display font-bold text-[#BCCBB9]">
                    <th className="py-3.5 px-4">Platillo</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Precio</th>
                    <th className="py-3.5 px-4">Promoción</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] text-sm">
                  {menuItems.map((item) => {
                    const catLabel =
                      CATEGORY_META.find((c) => c.id === item.category)?.shortLabel || item.category;
                    return (
                      <tr key={item.id} className="hover:bg-[#131316]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded overflow-hidden bg-[#0D0D11] shrink-0">
                              <DishImage
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-bold text-[#E4E1E6] truncate max-w-[240px]">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#869585]">{item.caloriesLabel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#BCCBB9] whitespace-nowrap">
                          {catLabel}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#E4E1E6] tabular-nums whitespace-nowrap">
                          {formatMxn(item.priceMxn)}
                        </td>
                        <td className="py-3 px-4 text-xs whitespace-nowrap">
                          {item.promoType === '2x1' ? (
                            <span className="font-display font-bold text-[#EF4444]">2X1</span>
                          ) : item.promoType === 'favorite' ? (
                            <span className="font-display font-bold text-[#FACC15]">#1 Favorito</span>
                          ) : item.promoType === 'combo' ? (
                            <span className="font-display font-bold text-[#4BE277]">Combo</span>
                          ) : (
                            <span className="text-[#869585]">Estándar</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => void onToggleAvailability(item)}
                            className={`px-2.5 py-1 rounded text-xs font-display font-bold transition-colors cursor-pointer ${
                              item.available
                                ? 'bg-[#22C55E]/20 text-[#4BE277] border border-[#22C55E]/50'
                                : 'bg-[#27272A] text-[#BCCBB9] border border-[#3D4A3D]'
                            }`}
                          >
                            {item.available ? 'Disponible' : 'Agotado'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditItemForm(item)}
                              aria-label={`Editar ${item.name}`}
                              className="p-2 rounded bg-[#131316] border border-[#27272A] hover:border-[#22C55E] text-[#E4E1E6] cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {deleteConfirmId === item.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onDeleteMenuItem(item.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2.5 py-1.5 rounded bg-[#EF4444] text-white font-display font-bold text-xs cursor-pointer"
                                >
                                  Borrar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1.5 rounded bg-[#131316] text-xs text-[#BCCBB9] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(item.id)}
                                aria-label={`Eliminar ${item.name}`}
                                className="p-2 rounded bg-[#131316] border border-[#27272A] hover:border-[#EF4444] text-[#FFB4AE] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOREFRONT SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettingsSubmit}
          className="max-w-2xl bg-[#18181B] border border-[#27272A] rounded-xl p-6 space-y-5 voxel-bevel"
        >
          <h2 className="font-display text-lg font-bold text-[#E4E1E6]">
            Configuración Operativa y WhatsApp
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#BCCBB9]">Nombre del restaurante</label>
              <input
                type="text"
                required
                maxLength={SCHEMA_LIMITS.SETTINGS_NAME_MAX}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#BCCBB9]">
                WhatsApp de pedidos (solo dígitos, con lada país)
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={whatsappNum}
                onChange={(e) => setWhatsappNum(e.target.value)}
                placeholder="5215512345678"
                className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#BCCBB9]">Texto del cintillo promocional</label>
            <input
              type="text"
              maxLength={SCHEMA_LIMITS.SETTINGS_BANNER_MAX}
              value={promoBanner}
              onChange={(e) => setPromoBanner(e.target.value)}
              className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-xs text-[#BCCBB9]">Tiempo estimado de cocina</label>
              <input
                type="text"
                maxLength={SCHEMA_LIMITS.SETTINGS_PREP_MAX}
                value={prepEstimate}
                onChange={(e) => setPrepEstimate(e.target.value)}
                placeholder="15–20 min"
                className="w-full h-11 px-3 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6]"
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-[#E4E1E6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="w-4 h-4 accent-[#22C55E]"
                />
                Cocina abierta aceptando pedidos
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#E4E1E6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={promoActive}
                  onChange={(e) => setPromoActive(e.target.checked)}
                  className="w-4 h-4 accent-[#FACC15]"
                />
                Mostrar cintillo promocional 2X1
              </label>
            </div>
          </div>

          {settingsMsg && (
            <p className="text-xs text-[#4BE277] bg-[#131316] border border-[#3D4A3D] rounded p-3 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {settingsMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#22C55E] hover:bg-[#4BE277] text-[#002109] font-display font-bold text-sm rounded cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      )}
    </section>
  );
}
