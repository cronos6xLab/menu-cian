import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Flame,
  LogIn,
  MessageCircle,
  PackageCheck,
  Receipt,
  XCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  formatMxn,
  formatWhatsAppTicket,
  fulfillmentLabel,
  orderToWhatsAppUrl,
} from '../lib/pricing';
import { Order, OrderStatus, StorefrontSettings } from '../types/menu';

interface OrderTrackerViewProps {
  user: User | null;
  orders: Order[];
  activeOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => Promise<void>;
  onSignIn: () => Promise<User | null>;
  onGoToMenu: () => void;
  settings: StorefrontSettings;
}

const PROGRESS_STEPS: {
  id: OrderStatus;
  label: string;
  caption: string;
  icon: typeof Receipt;
}[] = [
  {
    id: 'received',
    label: 'Recibido',
    caption: 'Comanda confirmada en cocina',
    icon: Receipt,
  },
  {
    id: 'crafting',
    label: 'En Crafteo',
    caption: 'Preparando pan, salsas y extras',
    icon: ChefHat,
  },
  {
    id: 'grill',
    label: 'En Plancha',
    caption: 'Sellando tu smash al fuego vivo',
    icon: Flame,
  },
  {
    id: 'ready',
    label: 'Listo',
    caption: 'Listo para entregar o recoger',
    icon: PackageCheck,
  },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'received') return 0;
  if (status === 'crafting') return 1;
  if (status === 'grill') return 2;
  if (status === 'ready') return 3;
  if (status === 'delivered') return 4;
  return -1;
}

function formatTime(ms: number): string {
  if (!ms) return 'Recién enviado';
  return new Date(ms).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderTrackerView({
  user,
  orders,
  activeOrderId,
  onSelectOrder,
  onCancelOrder,
  onSignIn,
  onGoToMenu,
  settings,
}: OrderTrackerViewProps) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!user) {
    return (
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-14">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-8 md:p-10 text-center space-y-5 voxel-bevel">
          <div className="w-14 h-14 mx-auto rounded-lg bg-[#131316] border border-[#27272A] flex items-center justify-center text-[#4BE277]">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold text-[#E4E1E6]">
              Seguimiento en vivo de tu pedido
            </h1>
            <p className="text-sm text-[#BCCBB9] leading-relaxed">
              Inicia sesión con tu cuenta de Google para consultar en tiempo real el avance de tus
              pedidos desde la plancha de cocina.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => void onSignIn()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] slime-glow transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión con Google
            </button>
            <button
              type="button"
              onClick={onGoToMenu}
              className="px-5 py-3 bg-[#131316] border border-[#27272A] text-[#E4E1E6] font-display font-bold text-sm rounded hover:border-[#3D4A3D] transition-colors cursor-pointer"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-14">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-8 md:p-10 text-center space-y-5 voxel-bevel">
          <div className="w-14 h-14 mx-auto rounded-lg bg-[#131316] border border-[#27272A] flex items-center justify-center text-[#869585]">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold text-[#E4E1E6]">
              Aún no tienes pedidos activos
            </h1>
            <p className="text-sm text-[#BCCBB9]">
              Cuando confirmes un pedido desde el carrito, aparecerá aquí con actualización
              automática en tiempo real.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToMenu}
            className="px-5 py-3 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] transition-colors cursor-pointer"
          >
            Ir al Menú
          </button>
        </div>
      </section>
    );
  }

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];
  const stepIndex = getStepIndex(currentOrder.status);
  const isCancelled = currentOrder.status === 'cancelled';
  const isDelivered = currentOrder.status === 'delivered';
  const whatsappUrl = orderToWhatsAppUrl(
    currentOrder,
    settings.restaurantName,
    settings.whatsappNumber
  );

  const handleCopy = async () => {
    const text = formatWhatsAppTicket({
      restaurantName: settings.restaurantName,
      orderCode: currentOrder.orderCode,
      customerName: currentOrder.customerName,
      fulfillmentType: currentOrder.fulfillmentType,
      tableOrAddress: currentOrder.tableOrAddress,
      notes: currentOrder.notes,
      items: currentOrder.items,
      subtotalMxn: currentOrder.subtotalMxn,
      discountMxn: currentOrder.discountMxn,
      discountLabel: currentOrder.discountLabel,
      totalMxn: currentOrder.totalMxn,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(currentOrder.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      setCopiedId(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancelOrder(currentOrder.id);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-display font-bold text-[#4BE277]">
            Sincronizado en tiempo real con cocina
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#E4E1E6] mt-1">
            Seguimiento de Pedido · {currentOrder.orderCode}
          </h1>
        </div>
        <button
          type="button"
          onClick={onGoToMenu}
          className="px-4 py-2.5 bg-[#18181B] border border-[#27272A] hover:border-[#22C55E] text-[#E4E1E6] font-display font-bold text-sm rounded transition-colors cursor-pointer self-start md:self-auto whitespace-nowrap"
        >
          Hacer otro pedido
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Live Order Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Banner + 4-Step Visual Progress */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 voxel-bevel space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#BCCBB9]">
                  <span>Folio {currentOrder.orderCode}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatTime(currentOrder.createdAtMs)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{fulfillmentLabel(currentOrder.fulfillmentType)}</span>
                </div>
                <p className="font-display text-xl font-bold text-[#E4E1E6]">
                  {isCancelled
                    ? 'Pedido cancelado'
                    : isDelivered
                    ? 'Pedido entregado — Buen provecho'
                    : PROGRESS_STEPS[Math.min(stepIndex, 3)]?.label || 'En proceso'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#93000A]/50 border border-[#EF4444] text-[#FFB4AE] font-display text-xs font-bold">
                    <XCircle className="w-4 h-4" />
                    Cancelado
                  </span>
                ) : isDelivered ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#22C55E] text-[#002109] font-display text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Entregado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#131316] border border-[#22C55E] text-[#4BE277] font-display text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    En vivo · {settings.prepTimeEstimate}
                  </span>
                )}
              </div>
            </div>

            {!isCancelled && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {PROGRESS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const completed = stepIndex > idx || isDelivered;
                  const active = stepIndex === idx && !isDelivered;
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded border transition-colors ${
                        active
                          ? 'bg-[#131316] border-[#22C55E] slime-glow'
                          : completed
                          ? 'bg-[#131316] border-[#3D4A3D]'
                          : 'bg-[#0D0D11] border-[#27272A] opacity-55'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded flex items-center justify-center ${
                            active
                              ? 'bg-[#22C55E] text-[#002109]'
                              : completed
                              ? 'bg-[#22C55E]/20 text-[#4BE277]'
                              : 'bg-[#18181B] text-[#869585]'
                          }`}
                        >
                          {completed ? (
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-display text-xs font-bold tabular-nums text-[#869585]">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="font-display text-sm font-bold text-[#E4E1E6]">{step.label}</p>
                      <p className="text-xs text-[#BCCBB9] mt-1 leading-snug">{step.caption}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Row: WhatsApp + Copy + Cancel if received */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#22C55E] text-[#002109] hover:bg-[#4BE277] font-display font-bold text-xs transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar comprobante por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#131316] border border-[#27272A] hover:border-[#3D4A3D] text-[#E4E1E6] font-display font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedId === currentOrder.id ? (
                    <>
                      <Check className="w-4 h-4 text-[#4BE277]" />
                      Ticket copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar resumen
                    </>
                  )}
                </button>
              </div>

              {currentOrder.status === 'received' && !confirmCancel && (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="px-3.5 py-2.5 rounded border border-[#EF4444]/50 text-[#FFB4AE] hover:bg-[#93000A]/30 font-display font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar pedido
                </button>
              )}

              {currentOrder.status === 'received' && confirmCancel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#FFB4AE]">¿Confirmar cancelación?</span>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded bg-[#EF4444] text-white font-display font-bold text-xs cursor-pointer"
                  >
                    {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="px-3 py-1.5 rounded bg-[#131316] border border-[#27272A] text-xs text-[#BCCBB9] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Receipt Card */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h2 className="font-display text-base font-bold text-[#E4E1E6]">
                Detalle del Ticket
              </h2>
              <span className="text-xs text-[#BCCBB9]">
                {currentOrder.customerName} · {currentOrder.tableOrAddress}
              </span>
            </div>

            <div className="divide-y divide-[#27272A]">
              {currentOrder.items.map((line, index) => (
                <div key={`${line.menuItemId}-${index}`} className="py-3 flex justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#E4E1E6]">
                      <span className="font-display font-bold text-[#4BE277] tabular-nums mr-1.5">
                        {line.quantity}x
                      </span>
                      {line.name}
                    </p>
                    {line.removedIngredients.length > 0 && (
                      <p className="text-xs text-[#FFB4AE]">
                        Sin: {line.removedIngredients.join(', ')}
                      </p>
                    )}
                    {line.selectedExtras.length > 0 && (
                      <p className="text-xs text-[#4BE277]">
                        Extras:{' '}
                        {line.selectedExtras.map((e) => `${e.quantity}x ${e.name}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#E4E1E6] tabular-nums shrink-0">
                    {formatMxn(line.lineTotalMxn)}
                  </span>
                </div>
              ))}
            </div>

            {currentOrder.notes && (
              <div className="p-3 rounded bg-[#131316] border border-[#27272A] text-xs text-[#BCCBB9]">
                <strong className="text-[#E4E1E6]">Notas de cocina:</strong> {currentOrder.notes}
              </div>
            )}

            <div className="pt-3 border-t border-[#27272A] space-y-1.5 text-sm">
              <div className="flex justify-between text-[#BCCBB9]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMxn(currentOrder.subtotalMxn)}</span>
              </div>
              {currentOrder.discountMxn > 0 && (
                <div className="flex justify-between text-[#4BE277]">
                  <span>{currentOrder.discountLabel || 'Descuento aplicado'}</span>
                  <span className="tabular-nums">-{formatMxn(currentOrder.discountMxn)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-bold text-[#E4E1E6]">
                <span className="font-display">Total Pagadero</span>
                <span className="text-[#4BE277] tabular-nums">
                  {formatMxn(currentOrder.totalMxn)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Sidebar (4 cols) */}
        <aside className="lg:col-span-4 bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-bold text-[#E4E1E6]">
            Tus pedidos recientes ({orders.length})
          </h2>
          <div className="space-y-2.5">
            {orders.map((order) => {
              const selected = order.id === currentOrder.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => {
                    onSelectOrder(order.id);
                    setConfirmCancel(false);
                  }}
                  className={`w-full text-left p-3.5 rounded border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#131316] border-[#22C55E]'
                      : 'bg-[#0D0D11] border-[#27272A] hover:border-[#3D4A3D]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-[#E4E1E6]">
                      {order.orderCode}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-[#4BE277]">
                      {formatMxn(order.totalMxn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#BCCBB9] mt-1">
                    <span>
                      {order.status === 'received'
                        ? 'Recibido'
                        : order.status === 'crafting'
                        ? 'En Crafteo'
                        : order.status === 'grill'
                        ? 'En Plancha'
                        : order.status === 'ready'
                        ? 'Listo'
                        : order.status === 'delivered'
                        ? 'Entregado'
                        : 'Cancelado'}
                    </span>
                    <span className="tabular-nums">{formatTime(order.createdAtMs)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
