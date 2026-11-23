import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { formatMxn } from '../lib/pricing';
import { MenuItem, SelectedExtra } from '../types/menu';
import { DishImage } from './DishImage';

interface CraftingModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirmAdd: (params: {
    item: MenuItem;
    quantity: number;
    removedIngredients: string[];
    selectedExtras: SelectedExtra[];
  }) => void;
}

export function CraftingModal({ item, onClose, onConfirmAdd }: CraftingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setRemovedIngredients([]);
      setExtraQuantities({});
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  const selectedExtras: SelectedExtra[] = useMemo(() => {
    if (!item) return [];
    return item.extraOptions
      .filter((opt) => (extraQuantities[opt.id] || 0) > 0)
      .map((opt) => ({
        id: opt.id,
        name: opt.name,
        priceMxn: opt.priceMxn,
        quantity: extraQuantities[opt.id],
      }));
  }, [item, extraQuantities]);

  const extrasUnitTotal = useMemo(
    () => selectedExtras.reduce((sum, e) => sum + e.priceMxn * e.quantity, 0),
    [selectedExtras]
  );

  if (!item) return null;

  const unitPriceMxn = item.priceMxn + extrasUnitTotal;
  const totalPriceMxn = unitPriceMxn * quantity;

  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
    );
  };

  const adjustExtra = (extraId: string, delta: number) => {
    setExtraQuantities((prev) => {
      const next = Math.max(0, Math.min(5, (prev[extraId] || 0) + delta));
      return { ...prev, [extraId]: next };
    });
  };

  const handleConfirm = () => {
    onConfirmAdd({
      item,
      quantity,
      removedIngredients,
      selectedExtras,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="craft-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[92vh] bg-[#18181B] border border-[#27272A] rounded-t-xl md:rounded-xl voxel-bevel flex flex-col overflow-hidden">
        {/* Header with Photo */}
        <div className="relative h-48 md:h-56 bg-[#0D0D11] shrink-0">
          <DishImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-[#18181B]/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar mesa de crafteo"
            className="absolute top-4 right-4 w-10 h-10 rounded bg-[#0D0D11]/85 border border-[#27272A] text-[#E4E1E6] hover:border-[#22C55E] inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-display font-bold text-[#4BE277]">
                Mesa de Crafteo {item.promoType === '2x1' ? '· Participa en 2X1' : ''}
              </p>
              <h2
                id="craft-modal-title"
                className="font-display text-2xl font-bold text-[#E4E1E6]"
              >
                {item.name}
              </h2>
            </div>
            <span className="font-sans text-lg font-bold text-[#E4E1E6] tabular-nums shrink-0">
              {formatMxn(item.priceMxn)}
            </span>
          </div>
        </div>

        {/* Scrollable Crafting Slots */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          <p className="text-sm text-[#BCCBB9] leading-relaxed">{item.description}</p>

          {/* Base Ingredients (Toggle to remove) */}
          {item.defaultIngredients.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-[#E4E1E6]">
                  Ingredientes base incluidos
                </h3>
                <span className="text-xs text-[#869585]">Desmarca los que prefieras retirar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {item.defaultIngredients.map((ingredient) => {
                  const isRemoved = removedIngredients.includes(ingredient);
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleIngredient(ingredient)}
                      className={`min-h-[44px] px-3.5 py-2.5 rounded border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isRemoved
                          ? 'bg-[#0D0D11] border-[#EF4444]/60 text-[#869585]'
                          : 'bg-[#131316] border-[#27272A] hover:border-[#3D4A3D] text-[#E4E1E6]'
                      }`}
                    >
                      <span className={`text-sm ${isRemoved ? 'line-through' : ''}`}>
                        {ingredient}
                      </span>
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                          isRemoved
                            ? 'border-[#EF4444] text-[#EF4444]'
                            : 'bg-[#22C55E] border-[#22C55E] text-[#002109]'
                        }`}
                      >
                        {isRemoved ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Modifiers with Crafting Steppers [ - ] 01 [ + ] */}
          {item.extraOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-[#E4E1E6]">
                  Extras de plancha y salsas
                </h3>
                <span className="text-xs text-[#FACC15] font-display font-bold">
                  Mejora tu platillo
                </span>
              </div>
              <div className="space-y-2.5">
                {item.extraOptions.map((extra) => {
                  const qty = extraQuantities[extra.id] || 0;
                  return (
                    <div
                      key={extra.id}
                      className={`p-3 rounded border flex items-center justify-between gap-3 transition-colors ${
                        qty > 0
                          ? 'bg-[#131316] border-[#22C55E]'
                          : 'bg-[#131316] border-[#27272A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#E4E1E6] truncate">{extra.name}</p>
                        <p className="text-xs text-[#4BE277] tabular-nums">
                          {extra.priceMxn > 0 ? `+${formatMxn(extra.priceMxn)}` : 'Sin costo extra'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 bg-[#0D0D11] border border-[#27272A] rounded p-1">
                        <button
                          type="button"
                          onClick={() => adjustExtra(extra.id, -1)}
                          disabled={qty === 0}
                          aria-label={`Quitar ${extra.name}`}
                          className="w-8 h-8 rounded bg-[#18181B] text-[#E4E1E6] hover:bg-[#27272A] disabled:opacity-35 inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-display text-sm font-bold tabular-nums text-[#E4E1E6]">
                          {String(qty).padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustExtra(extra.id, 1)}
                          disabled={qty >= 5}
                          aria-label={`Agregar ${extra.name}`}
                          className="w-8 h-8 rounded bg-[#22C55E] text-[#002109] hover:bg-[#4BE277] disabled:opacity-35 inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Crafting Footer */}
        <div className="p-4 md:p-5 bg-[#131316] border-t border-[#27272A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-[#0D0D11] border border-[#27272A] rounded p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Reducir cantidad"
              className="w-10 h-10 rounded bg-[#18181B] text-[#E4E1E6] hover:bg-[#27272A] inline-flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-display text-base font-bold tabular-nums text-[#E4E1E6]">
              {String(quantity).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Aumentar cantidad"
              className="w-10 h-10 rounded bg-[#18181B] text-[#E4E1E6] hover:bg-[#27272A] inline-flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[48px] px-5 py-3 bg-[#22C55E] hover:bg-[#4BE277] text-[#002109] font-display font-bold text-sm md:text-base rounded slime-glow transition-colors flex items-center justify-between gap-4 cursor-pointer whitespace-nowrap"
          >
            <span>Agregar al Carrito</span>
            <span className="tabular-nums">{formatMxn(totalPriceMxn)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
