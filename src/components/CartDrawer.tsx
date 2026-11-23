import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  Minus,
  PackageOpen,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { STORE_INFO } from '../data/seedMenu';
import {
  buildWhatsAppUrl,
  calculateCartPricing,
  cartToOrderLineItems,
  formatMxn,
  formatWhatsAppTicket,
} from '../lib/pricing';
import {
  CartItem,
  FulfillmentType,
  SCHEMA_LIMITS,
  StorefrontSettings,
} from '../types/menu';
import { DishImage } from './DishImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StorefrontSettings;
  user: User | null;
  onSignIn: () => Promise<User | null>;
  onUpdateQuantity: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onGoToPromos: () => void;
  onPlaceOrder: (details: {
    customerName: string;
    fulfillmentType: FulfillmentType;
    tableOrAddress: string;
    notes: string;
  }) => Promise<void>;
}

const ACCESSORY_SLOTS = [
  { id: 'cubiertos', label: 'Cubiertos' },
  { id: 'servilletas', label: 'Servilletas x10' },
  { id: 'guantes', label: 'Guantes Smash' },
  { id: 'sticker', label: 'Sticker Cianuro' },
] as const;

const PAYMENT_OPTIONS = ['Efectivo al repartidor', 'Tarjeta / Terminal', 'Transferencia'] as const;

export function CartDrawer({
  open,
  onClose,
  cart,
  settings,
  user,
  onSignIn,
  onUpdateQuantity,
  onRemoveItem,
  onGoToPromos,
  onPlaceOrder,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['servilletas']);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_OPTIONS[0]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const pricing = useMemo(() => calculateCartPricing(cart), [cart]);
  const effectiveName = customerName.trim() || user?.displayName || '';

  const combinedNotes = useMemo(() => {
    const parts: string[] = [];
    parts.push(`Pago: ${paymentMethod}`);
    if (selectedAccessories.length > 0) {
      const labels = ACCESSORY_SLOTS.filter((s) => selectedAccessories.includes(s.id)).map(
        (s) => s.label
      );
      parts.push(`Accesorios: ${labels.join(', ')}`);
    }
    if (notes.trim()) {
      parts.push(notes.trim());
    }
    return parts.join(' | ').slice(0, SCHEMA_LIMITS.ORDER_NOTES_MAX);
  }, [paymentMethod, selectedAccessories, notes]);

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((pricing.totalMxn / STORE_INFO.freeDeliveryMinMxn) * 100)
  );
  const remainingForFreeDelivery = Math.max(0, STORE_INFO.freeDeliveryMinMxn - pricing.totalMxn);

  const whatsappTicket = useMemo(() => {
    return formatWhatsAppTicket({
      restaurantName: settings.restaurantName,
      customerName: effectiveName || 'Cliente',
      fulfillmentType,
      tableOrAddress:
        tableOrAddress.trim() ||
        (fulfillmentType === 'pickup' ? 'Paso a recoger en Retorno 12' : 'Por confirmar'),
      notes: combinedNotes,
      items: cartToOrderLineItems(cart),
      subtotalMxn: pricing.subtotalMxn,
      discountMxn: pricing.totalDiscountMxn,
      discountLabel: pricing.discountLabel,
      totalMxn: pricing.totalMxn,
    });
  }, [
    settings.restaurantName,
    effectiveName,
    fulfillmentType,
    tableOrAddress,
    combinedNotes,
    cart,
    pricing,
  ]);

  const whatsappHref = useMemo(
    () => buildWhatsAppUrl(settings.whatsappNumber, whatsappTicket),
    [settings.whatsappNumber, whatsappTicket]
  );

  if (!open) return null;

  const toggleAccessory = (id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyTicket = async () => {
    try {
      await navigator.clipboard.writeText(whatsappTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmitOrder = async () => {
    setFormError('');
    if (!settings.isOpen) {
      setFormError('La cocina está cerrada temporalmente. Puedes enviar tu consulta por WhatsApp.');
      return;
    }

    const nameVal = effectiveName.slice(0, SCHEMA_LIMITS.ORDER_CUSTOMER_NAME_MAX);
    if (nameVal.length < SCHEMA_LIMITS.ORDER_CUSTOMER_NAME_MIN) {
      setFormError('Escribe tu nombre para identificar tu comanda.');
      return;
    }

    const addrVal = (
      tableOrAddress.trim() || (fulfillmentType === 'pickup' ? 'Recoger en local' : '')
    ).slice(0, SCHEMA_LIMITS.ORDER_ADDRESS_MAX);

    if (addrVal.length < SCHEMA_LIMITS.ORDER_ADDRESS_MIN) {
      setFormError(
        fulfillmentType === 'dine_in'
          ? 'Indica tu número de mesa.'
          : 'Indica tu dirección de entrega.'
      );
      return;
    }

    setSubmitting(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await onSignIn();
        if (!currentUser) {
          setFormError('Inicia sesión con Google para confirmar y rastrear tu pedido en vivo.');
          setSubmitting(false);
          return;
        }
      }

      await onPlaceOrder({
        customerName: nameVal,
        fulfillmentType,
        tableOrAddress: addrVal,
        notes: combinedNotes,
      });
      setTableOrAddress('');
      setNotes('');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No pudimos registrar el pedido. Intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Cofre de pedido"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md h-full bg-[#101217] border-l-2 border-[#262933] flex flex-col">
        {/* Minecraft Chest Drawer Header */}
        <div className="px-5 py-4 bg-[#14161C] border-b-2 border-[#262933] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <PackageOpen className="w-5 h-5 text-[#4BE277]" />
            <div>
              <h2 className="font-pixel text-sm font-bold text-[#E4E1E6]">
                COFRE DE PEDIDO [{cart.length}/9 SLOTS]
              </h2>
              <p className="text-[11px] text-[#869585] tabular-nums">
                {pricing.itemCount} {pricing.itemCount === 1 ? 'unidad' : 'unidades'} en inventario
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar cofre de pedido"
            className="w-10 h-10 rounded-sm bg-[#0A0B0E] border-2 border-[#262933] text-[#BCCBB9] hover:text-[#E4E1E6] hover:border-[#22C55E] inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-sm mc-slot border-2 border-[#262933] flex items-center justify-center text-[#869585]">
              <PackageOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-lg font-bold text-[#E4E1E6]">
                Tu cofre está vacío
              </p>
              <p className="text-sm text-[#BCCBB9]">
                Agrega Clásica Letal, Pecado Dulce o aprovecha nuestras 16 promos 2X1.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 mc-btn-green font-display font-bold text-sm rounded-sm cursor-pointer"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Minecraft XP Bar: Free Delivery Unlock */}
            <div className="p-3 rounded-sm bg-[#14161C] border-2 border-[#262933] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-display font-bold">
                <span className="text-[#BCCBB9]">DESBLOQUEO DE ENVÍO GRATIS</span>
                <span className="text-[#4BE277] tabular-nums">{freeDeliveryProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-[#0A0B0E] border border-[#262933] overflow-hidden">
                <div
                  className="h-full bg-[#22C55E] transition-all duration-200"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#869585]">
                {remainingForFreeDelivery === 0
                  ? 'Envío gratis desbloqueado en tu pedido.'
                  : `Te faltan ${formatMxn(remainingForFreeDelivery)} para envío gratis.`}
              </p>
            </div>

            {/* 2X1 Promo Hint */}
            {pricing.needsOneMoreFor2x1 && (
              <div className="p-3.5 rounded-sm bg-[#1C1114] border-2 border-[#EF4444]/70 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-display text-xs font-bold text-[#EF4444]">
                    Te falta 1 platillo para activar el 2X1
                  </p>
                  <p className="text-xs text-[#BCCBB9]">
                    Agrega otro artículo 2X1 y llévate el segundo sin costo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToPromos();
                  }}
                  className="px-3 py-1.5 rounded-sm bg-[#EF4444] text-white font-display text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#DC2626]"
                >
                  Ver 2X1
                </button>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartKey}
                  className="p-3.5 rounded-sm bg-[#14161C] border-2 border-[#262933] space-y-3 mc-panel"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-[#0A0B0E] border border-[#262933] shrink-0">
                      <DishImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 bg-[#0A0B0E]/90 text-[#4BE277] font-pixel text-[10px] font-bold">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-bold text-[#E4E1E6] leading-snug">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartKey)}
                          aria-label={`Soltar ${item.name}`}
                          className="text-[#869585] hover:text-[#EF4444] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#BCCBB9] tabular-nums mt-0.5">
                        {formatMxn(item.unitPriceMxn)} c/u
                        {item.promoType === '2x1' && (
                          <span className="text-[#EF4444] font-display font-bold ml-1.5">
                            · 2X1
                          </span>
                        )}
                      </p>

                      {item.removedIngredients.length > 0 && (
                        <p className="text-xs text-[#FFB4AE] mt-1">
                          Sin: {item.removedIngredients.join(', ')}
                        </p>
                      )}
                      {item.selectedExtras.length > 0 && (
                        <p className="text-xs text-[#4BE277] mt-1">
                          Extras:{' '}
                          {item.selectedExtras
                            .map((e) => `${e.quantity}x ${e.name}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262933]">
                    <div className="flex items-center gap-1.5 mc-slot border border-[#262933] rounded-sm p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartKey, -1)}
                        aria-label="Disminuir cantidad"
                        className="w-8 h-8 rounded-sm bg-[#16181E] text-[#E4E1E6] hover:bg-[#262933] inline-flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-display text-xs font-bold tabular-nums">
                        {String(item.quantity).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartKey, 1)}
                        aria-label="Aumentar cantidad"
                        className="w-8 h-8 rounded-sm bg-[#16181E] text-[#E4E1E6] hover:bg-[#262933] inline-flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-sans text-sm font-bold text-[#4BE277] tabular-nums">
                      {formatMxn(item.unitPriceMxn * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Hotbar de Accesorios & Complementos */}
            <div className="space-y-2">
              <p className="font-display text-xs font-bold text-[#BCCBB9]">
                Hotbar de accesorios (sin costo)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORY_SLOTS.map((acc) => {
                  const active = selectedAccessories.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccessory(acc.id)}
                      className={`px-3 py-2 rounded-sm border-2 text-xs font-display font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#142619] border-[#22C55E] text-[#6BFF8F]'
                          : 'mc-slot border-[#262933] text-[#869585] hover:text-[#E4E1E6]'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="p-4 rounded-sm bg-[#14161C] border-2 border-[#262933] space-y-2 text-sm">
              <div className="flex justify-between text-[#BCCBB9]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMxn(pricing.subtotalMxn)}</span>
              </div>

              {pricing.twoForOneDiscountMxn > 0 && (
                <div className="flex justify-between text-[#4BE277] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Descuento 2X1 ({pricing.twoForOneFreeCount} gratis)
                  </span>
                  <span className="tabular-nums">-{formatMxn(pricing.twoForOneDiscountMxn)}</span>
                </div>
              )}

              {pricing.comboSavingsMxn > 0 && (
                <div className="flex justify-between text-xs text-[#FACC15]">
                  <span>Ahorro incluido en Combos</span>
                  <span className="tabular-nums">{formatMxn(pricing.comboSavingsMxn)}</span>
                </div>
              )}

              <div className="pt-2.5 border-t border-[#262933] flex justify-between items-baseline">
                <span className="font-display font-bold text-base text-[#E4E1E6]">Total</span>
                <span className="font-sans font-bold text-xl text-[#4BE277] tabular-nums">
                  {formatMxn(pricing.totalMxn)}
                </span>
              </div>
            </div>

            {/* Delivery / Payment Details Form */}
            <div className="space-y-3.5">
              <h3 className="font-display text-sm font-bold text-[#E4E1E6]">
                Punto de entrega y pago
              </h3>

              <div className="grid grid-cols-3 gap-1.5 mc-slot p-1 rounded-sm border-2 border-[#262933]">
                {(
                  [
                    { id: 'delivery', label: 'Domicilio' },
                    { id: 'pickup', label: 'Recoger' },
                    { id: 'dine_in', label: 'En Mesa' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFulfillmentType(mode.id)}
                    className={`py-2 px-2 rounded-sm text-xs font-display font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      fulfillmentType === mode.id
                        ? 'bg-[#22C55E] text-[#002109]'
                        : 'text-[#BCCBB9] hover:text-[#E4E1E6]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-name">
                  Tu nombre o alias
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  maxLength={SCHEMA_LIMITS.ORDER_CUSTOMER_NAME_MAX}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={user?.displayName || 'Ej. Alex Mendoza'}
                  className="w-full h-11 px-3.5 mc-slot border-2 border-[#262933] focus:border-[#22C55E] focus:outline-none rounded-sm text-sm text-[#E4E1E6] placeholder:text-[#869585]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-location">
                  {fulfillmentType === 'dine_in'
                    ? 'Número de mesa'
                    : fulfillmentType === 'pickup'
                    ? 'Hora aproximada de recolección'
                    : 'Dirección de entrega (calle, número y colonia)'}
                </label>
                <input
                  id="checkout-location"
                  type="text"
                  maxLength={SCHEMA_LIMITS.ORDER_ADDRESS_MAX}
                  value={tableOrAddress}
                  onChange={(e) => setTableOrAddress(e.target.value)}
                  placeholder={
                    fulfillmentType === 'dine_in'
                      ? 'Ej. Mesa 04'
                      : fulfillmentType === 'pickup'
                      ? 'Ej. Paso en 20 min'
                      : 'Ej. Retorno 12, Jardín Balbuena...'
                  }
                  className="w-full h-11 px-3.5 mc-slot border-2 border-[#262933] focus:border-[#22C55E] focus:outline-none rounded-sm text-sm text-[#E4E1E6] placeholder:text-[#869585]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-payment">
                  Método de pago
                </label>
                <select
                  id="checkout-payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 mc-slot border-2 border-[#262933] focus:border-[#22C55E] focus:outline-none rounded-sm text-sm text-[#E4E1E6]"
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-notes">
                  Instrucciones especiales para cocina (opcional)
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  maxLength={140}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Papas bien doradas, salsa aparte..."
                  className="w-full px-3.5 py-2.5 mc-slot border-2 border-[#262933] focus:border-[#22C55E] focus:outline-none rounded-sm text-sm text-[#E4E1E6] placeholder:text-[#869585] resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-[#FFB4AE] bg-[#93000A]/30 border border-[#EF4444]/50 rounded-sm p-2.5">
                  {formError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Drawer Actions Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#14161C] border-t-2 border-[#262933] space-y-2.5 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitOrder}
              className="w-full min-h-[48px] px-4 py-3 mc-btn-green disabled:opacity-50 font-display font-bold text-sm rounded-sm transition-colors cursor-pointer"
            >
              {submitting
                ? 'Enviando a cocina...'
                : user
                ? `Confirmar Pedido · ${formatMxn(pricing.totalMxn)}`
                : `Entrar con Google y Confirmar · ${formatMxn(pricing.totalMxn)}`}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 rounded-sm border-2 border-[#262933] hover:border-[#22C55E] bg-[#0A0B0E] text-[#E4E1E6] font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#4BE277] shrink-0" />
                <span>Enviar WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyTicket}
                className="min-h-[44px] px-3 py-2 rounded-sm border-2 border-[#262933] hover:border-[#3D4A3D] bg-[#0A0B0E] text-[#BCCBB9] hover:text-[#E4E1E6] font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#4BE277] shrink-0" />
                    <span className="text-[#4BE277]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copiar ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
