import { useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import { CATEGORY_META, STUDIO_IMAGES } from '../data/seedMenu';
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

  const heroBurger = useMemo(
    () => items.find((i) => i.featured && i.available) || items[0],
    [items]
  );

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

  const currentCategoryInfo =
    CATEGORY_META.find((c) => c.id === activeCategory) || CATEGORY_META[0];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-menu');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pb-20">
      {/* Slim Dismissible Hazard Promo Strip (<= 40px) */}
      {settings.promoActive && !bannerDismissed && (
        <div className="bg-[#18181B] border-b border-[#27272A]">
          <div className="h-1 hazard-stripes w-full" aria-hidden="true" />
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('promo_2x1');
                scrollToCatalog();
              }}
              className="flex items-center gap-2.5 text-left text-xs md:text-sm text-[#E4E1E6] hover:text-[#FACC15] transition-colors cursor-pointer min-w-0"
            >
              <span className="font-display font-bold text-[#FACC15] whitespace-nowrap shrink-0">
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

      {/* Balanced 2-Column Storefront Hero */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-10 pt-8 md:pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch bg-[#131316] border border-[#27272A] rounded-xl overflow-hidden voxel-bevel">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#BCCBB9]">
                <span className={settings.isOpen ? 'text-[#4BE277]' : 'text-[#EF4444]'}>
                  {settings.isOpen ? 'Cocina abierta' : 'Cocina cerrada temporalmente'}
                </span>
                <span aria-hidden="true">·</span>
                <span>Preparación {settings.prepTimeEstimate}</span>
                <span aria-hidden="true">·</span>
                <span>Precios en MXN</span>
              </div>

              <h1
                className="font-display font-bold text-[#E4E1E6] tracking-tight leading-[1.08]"
                style={{
                  fontSize: 'clamp(2rem, 3.6vw, 3.25rem)',
                  textWrap: 'balance',
                }}
              >
                Smash burgers crujientes armadas a tu medida.
              </h1>

              <p className="text-sm md:text-base text-[#BCCBB9] leading-relaxed max-w-xl">
                Carne sellada al instante en plancha de hierro, pan brioche mantequilla y salsa
                Slime de cilantro y jalapeño. Personaliza cada capa en nuestra mesa de crafteo y
                sigue tu pedido en vivo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {heroBurger && (
                <button
                  type="button"
                  onClick={() => onOpenCraft(heroBurger)}
                  className="px-5 py-3 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] transition-all slime-glow cursor-pointer whitespace-nowrap"
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
                className="px-5 py-3 bg-transparent text-[#E4E1E6] border border-[#27272A] hover:border-[#EF4444] hover:text-[#FFB4AE] font-display font-bold text-sm rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                Ver Promos 2X1
              </button>
            </div>
          </div>

          {/* Right Media Showcase Column */}
          <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-[380px] bg-[#0D0D11]">
            <DishImage
              src={heroBurger?.imageUrl || STUDIO_IMAGES.heroSmash}
              alt={heroBurger?.name || 'Slime Overlord Doble'}
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11]/85 via-[#0D0D11]/20 to-transparent pointer-events-none" />
            {heroBurger && (
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-display font-bold text-[#FACC15]">
                    #1 de tus favoritos
                  </p>
                  <p className="font-display text-lg md:text-xl font-bold text-[#E4E1E6]">
                    {heroBurger.name}
                  </p>
                </div>
                <span className="font-sans font-bold text-lg text-[#4BE277] tabular-nums whitespace-nowrap">
                  {formatMxn(heroBurger.priceMxn)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main 12-Column Inventory Catalog */}
      <section
        id="catalogo-menu"
        className="max-w-[1440px] mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
      >
        {/* Desktop Sticky Category Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-5">
          <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-4 voxel-bevel space-y-4">
            <h2 className="font-display text-sm font-bold text-[#E4E1E6]">Categorías</h2>
            <div className="flex flex-col gap-1.5" role="tablist" aria-label="Categorías del menú">
              {CATEGORY_META.map((cat) => {
                const isActive = activeCategory === cat.id;
                const isPromo = cat.id === 'promo_2x1';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-display font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? isPromo
                          ? 'bg-[#EF4444] text-white critical-glow'
                          : 'bg-[#22C55E] text-[#002109]'
                        : 'bg-[#131316] text-[#BCCBB9] hover:bg-[#27272A] hover:text-[#E4E1E6]'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span
                      className={`text-xs tabular-nums ${
                        isActive
                          ? isPromo
                            ? 'text-white/90'
                            : 'text-[#002109]/80'
                          : 'text-[#869585]'
                      }`}
                    >
                      {categoryCounts[cat.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#FACC15] font-display text-xs font-bold">
              <Tag className="w-4 h-4 shrink-0" />
              <span>Cómo funciona el 2X1</span>
            </div>
            <p className="text-xs text-[#BCCBB9] leading-relaxed">
              Agrega 2 platillos con etiqueta <strong className="text-[#EF4444]">2X1</strong> al
              carrito y el sistema descuenta automáticamente la unidad de menor precio base en MXN.
            </p>
          </div>
        </aside>

        {/* Right 9-Column Showcase */}
        <div className="lg:col-span-9 space-y-6">
          {/* Mobile / Tablet Sticky Horizontal Hotbar */}
          <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-[#0D0D11]/95 backdrop-blur-md border-b border-[#27272A]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CATEGORY_META.map((cat) => {
                const isActive = activeCategory === cat.id;
                const isPromo = cat.id === 'promo_2x1';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded font-display font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? isPromo
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#22C55E] text-[#002109]'
                        : 'bg-[#18181B] text-[#BCCBB9] border border-[#27272A]'
                    }`}
                  >
                    {cat.shortLabel} ({categoryCounts[cat.id] || 0})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Title + Search Field */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#E4E1E6]">
                {currentCategoryInfo.label}
              </h2>
              <p className="text-sm text-[#BCCBB9] mt-1">{currentCategoryInfo.description}</p>
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-[#869585] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar burger, ingrediente..."
                aria-label="Buscar en el menú"
                className="w-full h-11 pl-10 pr-9 bg-[#0D0D11] border border-[#27272A] focus:border-[#22C55E] focus:outline-none rounded text-sm text-[#E4E1E6] placeholder:text-[#869585] transition-colors"
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

          {/* Product Grid */}
          {loadingMenu && items.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-[#18181B] border border-[#27272A] rounded overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#27272A]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#27272A] rounded w-2/3" />
                    <div className="h-3 bg-[#27272A] rounded w-full" />
                    <div className="h-9 bg-[#27272A] rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-10 text-center space-y-3">
              <p className="font-display text-lg font-bold text-[#E4E1E6]">
                No encontramos platillos con ese filtro
              </p>
              <p className="text-sm text-[#BCCBB9]">
                Prueba con otro término o regresa a la carta completa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSelectCategory('all');
                }}
                className="mt-2 px-4 py-2.5 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] transition-colors cursor-pointer"
              >
                Ver todo el menú
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isCustomizable =
                  item.defaultIngredients.length > 0 || item.extraOptions.length > 0;
                const categoryLabel =
                  CATEGORY_META.find((c) => c.id === item.category)?.shortLabel || item.category;

                return (
                  <article
                    key={item.id}
                    className={`group flex flex-col bg-[#18181B] border border-[#27272A] rounded voxel-bevel overflow-hidden transition-transform duration-150 ${
                      item.available
                        ? 'hover:-translate-y-0.5 hover:border-[#3D4A3D]'
                        : 'opacity-65'
                    }`}
                  >
                    {/* 4:3 Studio Dish Photography */}
                    <div
                      onClick={() => item.available && onOpenCraft(item)}
                      className={`relative aspect-[4/3] bg-[#0D0D11] overflow-hidden ${
                        item.available ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <DishImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      />

                      {/* Maximum 1 tactical corner badge */}
                      {!item.available ? (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#0D0D11]/90 border border-[#27272A] font-display text-xs font-bold text-[#BCCBB9]">
                          Agotado
                        </span>
                      ) : item.promoType === '2x1' ? (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#EF4444] font-display text-xs font-bold text-white critical-glow">
                          2X1
                        </span>
                      ) : item.promoType === 'favorite' ? (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#FACC15] font-display text-xs font-bold text-[#231B00]">
                          #1 Favorito
                        </span>
                      ) : item.promoType === 'combo' ? (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#22C55E] font-display text-xs font-bold text-[#002109]">
                          Combo
                        </span>
                      ) : null}
                    </div>

                    {/* Uniform Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#869585]">
                          <span>{categoryLabel}</span>
                          {item.caloriesLabel && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{item.caloriesLabel}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#E4E1E6] leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#BCCBB9] leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Price & Single-Tap / Craft Action Row */}
                      <div className="pt-3 border-t border-[#27272A] flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          {item.originalPriceMxn && item.originalPriceMxn > item.priceMxn && (
                            <span className="text-xs text-[#869585] line-through tabular-nums">
                              {formatMxn(item.originalPriceMxn)}
                            </span>
                          )}
                          <span className="font-sans text-base font-bold text-[#E4E1E6] tabular-nums">
                            {formatMxn(item.priceMxn)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCustomizable && (
                            <button
                              type="button"
                              disabled={!item.available}
                              onClick={() => onOpenCraft(item)}
                              className="h-11 px-3 rounded border border-[#27272A] text-xs font-display font-bold text-[#E4E1E6] hover:border-[#22C55E] hover:text-[#4BE277] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Armar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!item.available}
                            onClick={() => onQuickAdd(item)}
                            aria-label={`Agregar ${item.name} al carrito`}
                            className="w-11 h-11 rounded bg-[#22C55E] text-[#002109] hover:bg-[#4BE277] disabled:bg-[#27272A] disabled:text-[#869585] disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            <Plus className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
