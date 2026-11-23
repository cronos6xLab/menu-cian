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
    <header className="sticky top-0 z-40 bg-[#0D0D11]/95 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('menu')}
          className="font-display text-lg md:text-xl font-bold tracking-tight text-[#E4E1E6] hover:text-[#4BE277] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22C55E] focus-visible:outline-offset-4"
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
            className={`text-sm font-medium py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`text-sm font-medium py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`text-sm font-medium py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`text-sm font-medium py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'kitchen'
                ? 'text-[#FACC15] border-[#FACC15]'
                : 'text-[#BCCBB9] border-transparent hover:text-[#E4E1E6]'
            }`}
          >
            Cocina
          </button>
        </nav>

        {/* Zone 3: Single Primary Action (Cart CTA) */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir carrito con ${cartCount} artículos`}
            className={`inline-flex items-center gap-2.5 px-3.5 md:px-4 py-2 rounded font-display font-bold text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4BE277] focus-visible:outline-offset-2 ${
              cartCount > 0
                ? 'bg-[#22C55E] text-[#002109] hover:bg-[#4BE277] slime-glow'
                : 'bg-[#18181B] text-[#E4E1E6] border border-[#27272A] hover:border-[#22C55E]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {cartCount > 0 ? `${cartCount} · ${formatMxn(cartTotalMxn)}` : 'Carrito'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
