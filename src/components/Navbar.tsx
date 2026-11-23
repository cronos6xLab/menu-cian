import { ShoppingBag } from 'lucide-react';
import { AppView } from '../types/menu';
import { formatMxn } from '../lib/pricing';

interface NavbarProps {
  restaurantName: string;
  activeView: AppView;
  activeCategory: string;
  onSelectView: (view: AppView) => void;
  onSelectPromos: () => void;
  cartCount: number;
  cartTotalMxn: number;
  onOpenCart: () => void;
  hasActiveOrder: boolean;
}

export function Navbar({
  restaurantName,
  activeView,
  activeCategory,
  onSelectView,
  onSelectPromos,
  cartCount,
  cartTotalMxn,
  onOpenCart,
  hasActiveOrder,
}: NavbarProps) {
  const isMenuActive = activeView === 'menu' && activeCategory !== 'promo_2x1';
  const isPromosActive = activeView === 'menu' && activeCategory === 'promo_2x1';

  return (
    <header className="sticky top-0 z-40 bg-[#0A0B0E]/95 backdrop-blur-md border-b-2 border-[#1F3D25]">
      <div className="max-w-[1440px] mx-auto px-14 sm:px-20 md:px-24 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('menu')}
          className="font-pixel text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#4BE277] hover:text-[#6BFF8F] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22C55E] focus-visible:outline-offset-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.35)]"
        >
          {restaurantName}
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-4 md:gap-7 overflow-x-auto no-scrollbar"
        >
          <button
            type="button"
            onClick={() => onSelectView('menu')}
            className={`text-xs md:text-sm font-display font-bold py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isMenuActive
                ? 'text-[#4BE277] border-[#22C55E]'
                : 'text-[#BCCBB9] border-transparent hover:text-[#E4E1E6]'
            }`}
          >
            Menú
          </button>
          <button
            type="button"
            onClick={onSelectPromos}
            className={`text-xs md:text-sm font-display font-bold py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isPromosActive
                ? 'text-[#EF4444] border-[#EF4444]'
                : 'text-[#BCCBB9] border-transparent hover:text-[#E4E1E6]'
            }`}
          >
            Promos 2X1
          </button>
          <button
            type="button"
            onClick={() => onSelectView('tracker')}
            className={`text-xs md:text-sm font-display font-bold py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'tracker'
                ? 'text-[#4BE277] border-[#22C55E]'
                : 'text-[#BCCBB9] border-transparent hover:text-[#E4E1E6]'
            }`}
          >
            {hasActiveOrder ? 'Mi Pedido (Activo)' : 'Mi Pedido'}
          </button>
          <button
            type="button"
            onClick={() => onSelectView('kitchen')}
            className={`text-xs md:text-sm font-display font-bold py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'kitchen'
                ? 'text-[#FACC15] border-[#FACC15]'
                : 'text-[#BCCBB9] border-transparent hover:text-[#E4E1E6]'
            }`}
          >
            Cocina
          </button>
        </nav>

        {/* Zone 3: Single Primary Action (Chest Cart CTA) */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir cofre de pedido con ${cartCount} artículos`}
            className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded font-display font-bold text-xs md:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4BE277] focus-visible:outline-offset-2 ${
              cartCount > 0
                ? 'mc-btn-green'
                : 'bg-[#16181E] text-[#E4E1E6] border-2 border-[#27272A] hover:border-[#22C55E]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {cartCount > 0 ? `${cartCount} · ${formatMxn(cartTotalMxn)}` : 'Cofre'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
