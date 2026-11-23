import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
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
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('dine_in');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const pricing = useMemo(() => calculateCartPricing(cart), [cart]);

  const effectiveName = customerName.trim() || user?.displayName || '';

  const whatsappTicket = useMemo(() => {
    return formatWhatsAppTicket({
      restaurantName: settings.restaurantName,
      customerName: effectiveName || 'Cliente',
      fulfillmentType,
      tableOrAddress:
        tableOrAddress.trim() ||
        (fulfillmentType === 'pickup' ? 'Paso a recoger en barra' : 'Por confirmar'),
      notes,
      items: cartToOrderLineItems(cart),
      subtotalMxn: pricing.subtotalMxn,
      discountMxn: pricing.totalDiscountMxn,
      discountLabel: pricing.discountLabel,
      totalMxn: pricing.totalMxn,
    });
  }, [settings.restaurantName, effectiveName, fulfillmentType, tableOrAddress, notes, cart, pricing]);

  const whatsappHref = useMemo(
    () => buildWhatsAppUrl(settings.whatsappNumber, whatsappTicket),
    [settings.whatsappNumber, whatsappTicket]
  );

  if (!open) return null;

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
      tableOrAddress.trim() || (fulfillmentType === 'pickup' ? 'Recoger en barra' : '')
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
        notes: notes.trim().slice(0, SCHEMA_LIMITS.ORDER_NOTES_MAX),
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
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md h-full bg-[#131316] border-l border-[#27272A] flex flex-col">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#4BE277]" />
            <h2 className="font-display text-lg font-bold text-[#E4E1E6]">
              Tu Pedido ({pricing.itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="w-10 h-10 rounded bg-[#0D0D11] border border-[#27272A] text-[#BCCBB9] hover:text-[#E4E1E6] inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#869585]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-lg font-bold text-[#E4E1E6]">
                Tu inventario está vacío
              </p>
              <p className="text-sm text-[#BCCBB9]">
                Agrega smash burgers, papas cargadas o aprovecha la promo 2X1.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] transition-colors cursor-pointer"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 2X1 Promo Hint */}
            {pricing.needsOneMoreFor2x1 && (
              <div className="p-3.5 rounded bg-[#18181B] border border-[#EF4444]/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-display text-xs font-bold text-[#EF4444]">
                    Te falta 1 platillo para activar el 2X1
                  </p>
                  <p className="text-xs text-[#BCCBB9]">
                    Agrega otro artículo marcado 2X1 y llévate el segundo gratis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToPromos();
                  }}
                  className="px-3 py-1.5 rounded bg-[#EF4444] text-white font-display text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer hover:bg-[#DC2626]"
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
                  className="p-3.5 rounded bg-[#18181B] border border-[#27272A] space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded overflow-hidden bg-[#0D0D11] shrink-0">
                      <DishImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-bold text-[#E4E1E6] leading-snug">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartKey)}
                          aria-label={`Eliminar ${item.name}`}
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

                  <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                    <div className="flex items-center gap-1.5 bg-[#0D0D11] border border-[#27272A] rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartKey, -1)}
                        aria-label="Disminuir cantidad"
                        className="w-8 h-8 rounded bg-[#18181B] text-[#E4E1E6] hover:bg-[#27272A] inline-flex items-center justify-center cursor-pointer"
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
                        className="w-8 h-8 rounded bg-[#18181B] text-[#E4E1E6] hover:bg-[#27272A] inline-flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-sans text-sm font-bold text-[#E4E1E6] tabular-nums">
                      {formatMxn(item.unitPriceMxn * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="p-4 rounded bg-[#18181B] border border-[#27272A] space-y-2 text-sm">
              <div className="flex justify-between text-[#BCCBB9]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMxn(pricing.subtotalMxn)}</span>
              </div>

              {pricing.twoForOneDiscountMxn > 0 && (
                <div className="flex justify-between text-[#4BE277] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Promo 2X1 ({pricing.twoForOneFreeCount} gratis)
                  </span>
                  <span className="tabular-nums">-{formatMxn(pricing.twoForOneDiscountMxn)}</span>
                </div>
              )}

              {pricing.comboSavingsMxn > 0 && (
                <div className="flex justify-between text-xs text-[#FACC15]">
                  <span>Ahorro ya incluido en Combos</span>
                  <span className="tabular-nums">{formatMxn(pricing.comboSavingsMxn)}</span>
                </div>
              )}

              <div className="pt-2.5 border-t border-[#27272A] flex justify-between items-baseline">
                <span className="font-display font-bold text-base text-[#E4E1E6]">Total</span>
                <span className="font-sans font-bold text-xl text-[#4BE277] tabular-nums">
                  {formatMxn(pricing.totalMxn)}
                </span>
              </div>
            </div>

            {/* Delivery / Table Details Form */}
            <div className="space-y-3.5">
              <h3 className="font-display text-sm font-bold text-[#E4E1E6]">
                Datos de tu pedido
              </h3>

              <div className="grid grid-cols-3 gap-1.5 bg-[#0D0D11] p-1 rounded border border-[#27272A]">
                {(
                  [
                    { id: 'dine_in', label: 'En Mesa' },
                    { id: 'pickup', label: 'Recoger' },
                    { id: 'delivery', label: 'Domicilio' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFulfillmentType(mode.id)}
                    className={`py-2 px-2 rounded text-xs font-display font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
                  className="w-full h-11 px-3.5 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] placeholder:text-[#869585]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-location">
                  {fulfillmentType === 'dine_in'
                    ? 'Número de mesa'
                    : fulfillmentType === 'pickup'
                    ? 'Hora aproximada o referencia'
                    : 'Dirección completa de entrega'}
                </label>
                <input
                  id="checkout-location"
                  type="text"
                  maxLength={SCHEMA_LIMITS.ORDER_ADDRESS_MAX}
                  value={tableOrAddress}
                  onChange={(e) => setTableOrAddress(e.target.value)}
                  placeholder={
                    fulfillmentType === 'dine_in'
                      ? 'Ej. Mesa 07'
                      : fulfillmentType === 'pickup'
                      ? 'Ej. Paso en 15 minutos'
                      : 'Calle, número, colonia y referencias'
                  }
                  className="w-full h-11 px-3.5 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] placeholder:text-[#869585]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-[#BCCBB9]" htmlFor="checkout-notes">
                  Notas para cocina (opcional)
                </label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  maxLength={SCHEMA_LIMITS.ORDER_NOTES_MAX}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Servilletas extra, salsa aparte..."
                  className="w-full px-3.5 py-2.5 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] placeholder:text-[#869585] resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-[#FFB4AE] bg-[#93000A]/30 border border-[#EF4444]/50 rounded p-2.5">
                  {formError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Drawer Actions Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#18181B] border-t border-[#27272A] space-y-2.5 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitOrder}
              className="w-full min-h-[48px] px-4 py-3 bg-[#22C55E] hover:bg-[#4BE277] disabled:opacity-50 text-[#002109] font-display font-bold text-sm rounded slime-glow transition-colors cursor-pointer"
            >
              {submitting
                ? 'Enviando a cocina...'
                : user
                ? `Confirmar Pedido en Cocina · ${formatMxn(pricing.totalMxn)}`
                : `Iniciar con Google y Confirmar · ${formatMxn(pricing.totalMxn)}`}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 rounded border border-[#27272A] hover:border-[#22C55E] bg-[#0D0D11] text-[#E4E1E6] font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Enviar WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyTicket}
                className="min-h-[44px] px-3 py-2 rounded border border-[#27272A] hover:border-[#3D4A3D] bg-[#0D0D11] text-[#BCCBB9] hover:text-[#E4E1E6] font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#4BE277] shrink-0" />
                    <span className="text-[#4BE277]">Ticket copiado</span>
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
