import { useMemo, useState } from 'react';
import {
  Flame,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import { CATEGORY_META, STORE_INFO, STUDIO_IMAGES } from '../data/seedMenu';
import { formatMxn } from '../lib/pricing';
import { MenuCategory, MenuItem, StorefrontSettings } from '../types/menu';
import { DishImage } from './DishImage';

interface MenuViewProps {
  items: MenuItem[];
  settings: StorefrontSettings;
  activeCategory: MenuCategory | 'all' | 'promo_2x1';
  onSelectCategory: (cat: MenuCategory | 'all' | 'promo_2x1') => void;
  onQuickAdd: (item: MenuItem) => void;
  onOpenCraft: (item: MenuItem) => void;
  loadingMenu: boolean;
}

const ORDERED_SECTIONS: MenuCategory[] = [
  'burgers',
  'burgers_papas',
  'combos',
  'sandwiches',
  'papas_especiales',
  'papas_fritas',
  'bebidas',
];

export function MenuView({
  items,
  settings,
  activeCategory,
  onSelectCategory,
  onQuickAdd,
  onOpenCraft,
  loadingMenu,
}: MenuViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const featuredItems = useMemo(() => {
    const picked = items.filter((i) => i.featured && i.available);
    return (picked.length >= 4 ? picked : items).slice(0, 4);
  }, [items]);

  const heroBurger = featuredItems[0] || items[0];

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategory === 'promo_2x1' && item.promoType !== '2x1') return false;
      if (activeCategory !== 'all' && activeCategory !== 'promo_2x1' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.defaultIngredients.some((ing) => ing.toLowerCase().includes(q))
      );
    });
  }, [items, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length,
      promo_2x1: items.filter((i) => i.promoType === '2x1').length,
    };
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [items]);

  const groupedSections = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery.trim().length > 0) {
      return null;
    }
    return ORDERED_SECTIONS.map((catId) => ({
      meta: CATEGORY_META.find((c) => c.id === catId)!,
      items: items.filter((i) => i.category === catId),
    })).filter((g) => g.items.length > 0);
  }, [activeCategory, searchQuery, items]);

  const currentCategoryInfo =
    CATEGORY_META.find((c) => c.id === activeCategory) || CATEGORY_META[0];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-menu');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const renderProductCard = (item: MenuItem) => {
    const isCustomizable =
      item.defaultIngredients.length > 0 || item.extraOptions.length > 0;

    return (
      <article
        key={item.id}
        className={`group flex flex-col bg-[#14161C] border-2 border-[#262933] rounded mc-panel overflow-hidden transition-all duration-150 ${
          item.available
            ? 'hover:-translate-y-0.5 hover:border-[#22C55E]'
            : 'opacity-60'
        }`}
      >
        <div className="p-4 flex gap-3.5 items-start flex-1">
          {/* Left Content Column */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-2.5">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-[#E4E1E6] leading-snug">
                {item.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-bold text-[#4BE277] tabular-nums">
                  {formatMxn(item.priceMxn)}
                </span>
                {item.originalPriceMxn && item.originalPriceMxn > item.priceMxn && (
                  <span className="text-xs text-[#869585] line-through tabular-nums">
                    {formatMxn(item.originalPriceMxn)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#BCCBB9] leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            {/* Single Tactical Promo Label */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {!item.available ? (
                <span className="inline-block px-2 py-0.5 rounded-sm bg-[#27272A] text-[#BCCBB9] font-display text-[11px] font-bold">
                  Agotado
                </span>
              ) : item.promoType === '2x1' ? (
                <span className="inline-block px-2 py-0.5 rounded-sm bg-[#EF4444] text-white font-display text-[11px] font-bold tracking-tight">
                  COMPRA 1, OBTÉN 1 SIN COSTO
                </span>
              ) : item.promoType === 'combo' ? (
                <span className="inline-block px-2 py-0.5 rounded-sm bg-[#15803D]/50 border border-[#22C55E]/60 text-[#6BFF8F] font-display text-[11px] font-bold">
                  COMBO PRO
                </span>
              ) : item.promoType === 'favorite' ? (
                <span className="inline-block px-2 py-0.5 rounded-sm bg-[#FACC15] text-[#231B00] font-display text-[11px] font-bold">
                  POPULAR
                </span>
              ) : (
                <span className="text-[11px] text-[#869585]">{item.caloriesLabel}</span>
              )}
            </div>
          </div>

          {/* Right Square Dish Image + Quick Add Block */}
          <div className="w-28 sm:w-32 shrink-0 flex flex-col gap-2">
            <div
              onClick={() => item.available && onOpenCraft(item)}
              className={`relative aspect-square rounded-sm overflow-hidden bg-[#0A0B0E] border-2 border-[#262933] ${
                item.available ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <DishImage
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {isCustomizable && (
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() => onOpenCraft(item)}
                  className="flex-1 h-9 px-2 rounded-sm bg-[#0D0E12] border border-[#2D313D] hover:border-[#22C55E] text-[#BCCBB9] hover:text-[#4BE277] disabled:opacity-40 font-display text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Mod</span>
                </button>
              )}
              <button
                type="button"
                disabled={!item.available}
                onClick={() => onQuickAdd(item)}
                aria-label={`Agregar ${item.name} al cofre`}
                className="w-9 h-9 rounded-sm mc-btn-green disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.75]" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="pb-20">
      {/* Slim Hazard Radioactive Promo Strip */}
      {settings.promoActive && !bannerDismissed && (
        <div className="bg-[#12141A] border-b-2 border-[#262933]">
          <div className="h-1.5 hazard-stripes w-full" aria-hidden="true" />
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('promo_2x1');
                scrollToCatalog();
              }}
              className="flex items-center gap-2.5 text-left text-xs md:text-sm text-[#E4E1E6] hover:text-[#FACC15] transition-colors cursor-pointer min-w-0"
            >
              <span className="font-pixel text-xs font-bold text-[#002109] bg-[#4BE277] px-2 py-0.5 rounded-sm shrink-0">
                2X1
              </span>
              <span className="truncate">{settings.promoBannerText}</span>
            </button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Ocultar aviso promocional"
              className="text-[#BCCBB9] hover:text-[#E4E1E6] p-1 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Storefront Hero: Cianuro Burger BL + Artículos Destacados */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-10 pt-6 md:pt-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-[#12141A] border-2 border-[#243B29] rounded-lg overflow-hidden mc-panel">
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#BCCBB9]">
                <span className={settings.isOpen ? 'text-[#4BE277] font-semibold' : 'text-[#EF4444] font-semibold'}>
                  {settings.isOpen ? 'Cocina abierta' : 'Cerrado temporalmente'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{STORE_INFO.rating}</span>
                <span aria-hidden="true">·</span>
                <span>{STORE_INFO.shortHours}</span>
                <span aria-hidden="true">·</span>
                <span>Entrega aprox. {settings.prepTimeEstimate}</span>
              </div>

              <h1
                className="font-display font-bold text-[#E4E1E6] tracking-tight leading-[1.08]"
                style={{
                  fontSize: 'clamp(1.85rem, 3.4vw, 2.95rem)',
                  textWrap: 'balance',
                }}
              >
                {settings.restaurantName} — Zona Smash Radioactiva.
              </h1>

              <p className="text-sm text-[#BCCBB9] leading-relaxed max-w-xl">
                {STORE_INFO.address}. Burgers artesanales en brioche dorado, costras de mozzarella
                y promos 2X1 automáticas directo a tu cofre de pedido.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {heroBurger && (
                <button
                  type="button"
                  onClick={() => onOpenCraft(heroBurger)}
                  className="px-5 py-3 mc-btn-green font-display font-bold text-sm rounded-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Armar {heroBurger.name}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('promo_2x1');
                  scrollToCatalog();
                }}
                className="px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-sm rounded-sm critical-glow transition-colors cursor-pointer whitespace-nowrap"
              >
                Ver 16 Promos 2X1
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[300px] bg-[#0A0B0E] border-t-2 lg:border-t-0 lg:border-l-2 border-[#262933]">
            <DishImage
              src={heroBurger?.imageUrl || STUDIO_IMAGES.heroSmash}
              alt={heroBurger?.name || 'Cianuro Burger BL'}
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E]/90 via-[#0A0B0E]/20 to-transparent pointer-events-none" />
            {heroBurger && (
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-pixel text-[11px] text-[#4BE277]">#1 DE TUS FAVORITOS</p>
                  <p className="font-display text-lg font-bold text-[#E4E1E6]">
                    {heroBurger.name}
                  </p>
                </div>
                <span className="font-sans text-lg font-bold text-[#4BE277] tabular-nums whitespace-nowrap">
                  {formatMxn(heroBurger.priceMxn)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Artículos Destacados Strip (from User's Menu Screenshot) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#E4E1E6]">
              Artículos destacados
            </h2>
            <span className="text-xs text-[#869585]">Más pedidos en Cianuro Burger BL</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {featuredItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#14161C] border-2 border-[#262933] hover:border-[#22C55E] rounded mc-panel overflow-hidden flex flex-col justify-between transition-colors"
              >
                <div
                  onClick={() => item.available && onOpenCraft(item)}
                  className="relative aspect-[4/3] bg-[#0A0B0E] cursor-pointer"
                >
                  <DishImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#22C55E] text-[#002109] font-display text-[11px] font-bold">
                    #{idx + 1} de tus favoritos
                  </span>
                </div>
                <div className="p-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-[#E4E1E6] truncate">
                      {item.name}
                    </p>
                    <p className="font-sans text-sm font-bold text-[#4BE277] tabular-nums">
                      {formatMxn(item.priceMxn)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => onQuickAdd(item)}
                    aria-label={`Agregar ${item.name}`}
                    className="w-9 h-9 rounded-sm mc-btn-green inline-flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.75]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Minecraft Hotbar Category Strip (Always Reachable) */}
      <div className="sticky top-16 z-30 bg-[#0A0B0E]/95 backdrop-blur-md border-y-2 border-[#262933]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_META.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isPromo = cat.id === 'promo_2x1';
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  scrollToCatalog();
                }}
                className={`min-h-[40px] px-3.5 py-2 rounded-sm font-display font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer border-2 ${
                  isActive
                    ? isPromo
                      ? 'bg-[#EF4444] border-[#FF8A83] text-white critical-glow'
                      : 'bg-[#22C55E] border-[#6BFF8F] text-[#002109]'
                    : 'bg-[#14161C] border-[#262933] text-[#BCCBB9] hover:border-[#3D4A3D] hover:text-[#E4E1E6]'
                }`}
              >
                {cat.shortLabel} ({categoryCounts[cat.id] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Column Minecraft Inventory & Catalog Grid */}
      <section
        id="catalogo-menu"
        className="max-w-[1440px] mx-auto px-4 md:px-10 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
      >
        {/* Left Desktop Sidebar: INVENTARIO RACIÓN (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-5">
          <div className="bg-[#14161C] border-2 border-[#262933] rounded-md p-4 mc-panel space-y-4">
            <div className="flex items-center justify-between border-b border-[#262933] pb-2.5">
              <span className="font-pixel text-xs font-bold text-[#4BE277]">
                INVENTARIO RACIÓN
              </span>
              <span className="text-[11px] text-[#869585] tabular-nums">{items.length} ítems</span>
            </div>

            {/* 2x2 Minecraft Slot Grid */}
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'all', label: 'TODAS', icon: Package },
                  { id: 'burgers', label: 'SENCILLAS', icon: Flame },
                  { id: 'burgers_papas', label: 'CON PAPAS', icon: Utensils },
                  { id: 'combos', label: 'COMBOS', icon: Wrench },
                ] as const
              ).map((slot) => {
                const Icon = slot.icon;
                const active = activeCategory === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectCategory(slot.id)}
                    className={`p-3 rounded-sm border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#22C55E] border-[#6BFF8F] text-[#002109]'
                        : 'mc-slot border-[#262933] text-[#BCCBB9] hover:border-[#22C55E] hover:text-[#E4E1E6]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-display text-[11px] font-bold">{slot.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Categories List */}
            <div className="pt-2 border-t border-[#262933] space-y-1">
              {CATEGORY_META.filter((c) =>
                ['sandwiches', 'papas_especiales', 'papas_fritas', 'bebidas'].includes(c.id)
              ).map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full px-3 py-2 rounded-sm text-xs font-display font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#22C55E] text-[#002109]'
                        : 'text-[#BCCBB9] hover:bg-[#1E222B] hover:text-[#E4E1E6]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="tabular-nums opacity-80">{categoryCounts[cat.id] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REGLA 2X1 CIANURO Box */}
          <div className="bg-[#1C1114] border-2 border-[#EF4444]/70 rounded-md p-4 space-y-2 mc-panel">
            <p className="font-pixel text-xs font-bold text-[#EF4444]">REGLA 2X1 CIANURO</p>
            <p className="text-xs text-[#E4E1E6]/90 leading-relaxed">
              Compra 1 burger sencilla o con papas marcada 2X1 y desbloquea automáticamente el ítem
              gemelo de menor precio sin costo en tu cofre.
            </p>
            <button
              type="button"
              onClick={() => onSelectCategory('promo_2x1')}
              className="w-full mt-1 py-2 rounded-sm bg-[#EF4444] hover:bg-[#DC2626] text-white font-display text-xs font-bold cursor-pointer transition-colors"
            >
              Ver todos los 2X1 ({categoryCounts.promo_2x1 || 0})
            </button>
          </div>
        </aside>

        {/* Right 9-Column Dynamic Menu Catalog */}
        <div className="lg:col-span-9 space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#E4E1E6]">
                {currentCategoryInfo.label}
              </h2>
              <p className="text-sm text-[#BCCBB9] mt-1">{currentCategoryInfo.description}</p>
            </div>

            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="w-4 h-4 text-[#4BE277] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en Cianuro Burger BL..."
                aria-label="Buscar platillo en Cianuro Burger BL"
                className="w-full h-11 pl-10 pr-9 mc-slot border-2 border-[#262933] focus:border-[#22C55E] focus:outline-none rounded-sm text-sm text-[#E4E1E6] placeholder:text-[#869585] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#869585] hover:text-[#E4E1E6] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loadingMenu && items.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-40 bg-[#14161C] border-2 border-[#262933] rounded animate-pulse"
                />
              ))}
            </div>
          ) : groupedSections ? (
            /* Full Grouped Menu View matching User's Screenshots */
            <div className="space-y-10">
              {groupedSections.map((section) => (
                <div key={section.meta.id} className="space-y-4">
                  {/* Hazard Yellow Combo Crafting Divider before Combos */}
                  {section.meta.id === 'combos' && (
                    <div className="bg-[#FACC15] text-[#231B00] px-4 py-2.5 rounded-sm flex flex-wrap items-center justify-between gap-2 font-display font-bold text-xs md:text-sm">
                      <span className="inline-flex items-center gap-2">
                        <Wrench className="w-4 h-4 shrink-0" />
                        MESA DE CRAFTEO DE COMBOS
                      </span>
                      <span className="text-[11px] uppercase tracking-wide">
                        Incluye papas crujientes + refresco de lata
                      </span>
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-4 border-b-2 border-[#262933] pb-2.5">
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-[#E4E1E6]">
                        {section.meta.label}
                      </h3>
                      <p className="text-xs text-[#869585] mt-0.5">{section.meta.description}</p>
                    </div>
                    <span className="font-pixel text-xs text-[#4BE277] whitespace-nowrap">
                      {section.items.length} RECETAS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map(renderProductCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-[#14161C] border-2 border-[#262933] rounded-lg p-10 text-center space-y-3">
              <p className="font-display text-lg font-bold text-[#E4E1E6]">
                No encontramos platillos con ese filtro
              </p>
              <p className="text-sm text-[#BCCBB9]">
                Prueba con otro nombre o vuelve a la carta completa de Cianuro Burger BL.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSelectCategory('all');
                }}
                className="mt-2 px-4 py-2.5 mc-btn-green font-display font-bold text-sm rounded-sm cursor-pointer"
              >
                Ver todo el menú
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(renderProductCard)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
