import { MenuCategory, MenuItem, StorefrontSettings } from '../types/menu';

export const STUDIO_IMAGES = {
  heroSmash: '/src/assets/images/hero_slime_smash_1795409854710.jpg',
  toxicMelt: '/src/assets/images/burger_toxic_melt_1795409856078.jpg',
  obsidianBbq: '/src/assets/images/burger_obsidian_bbq_1795409853506.jpg',
  tacticalCombo: '/src/assets/images/combo_tactical_box_1795409854242.jpg',
  loadedFries: '/src/assets/images/sides_loaded_fries_1795409854889.jpg',
  slimeShake: '/src/assets/images/drink_slime_shake_1795409855130.jpg',
} as const;

export const STUDIO_IMAGE_OPTIONS = [
  { label: 'Slime Smash Doble (Hero)', url: STUDIO_IMAGES.heroSmash },
  { label: 'Toxic Melt Triple', url: STUDIO_IMAGES.toxicMelt },
  { label: 'Obsidian BBQ Crunch', url: STUDIO_IMAGES.obsidianBbq },
  { label: 'Combo Táctico Completo', url: STUDIO_IMAGES.tacticalCombo },
  { label: 'Papas Radiactivas Loaded', url: STUDIO_IMAGES.loadedFries },
  { label: 'Malteada Slime Pistache', url: STUDIO_IMAGES.slimeShake },
];

export const CATEGORY_META: {
  id: MenuCategory | 'all' | 'promo_2x1';
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'all',
    label: 'Todo el Menú',
    shortLabel: 'Todo',
    description: 'Carta completa artesanal de Slime Craft Burgers.',
  },
  {
    id: 'promo_2x1',
    label: 'Promos 2X1',
    shortLabel: '2X1',
    description: 'Combina dos platillos participantes y la unidad de menor precio va gratis.',
  },
  {
    id: 'burgers',
    label: 'Smash Burgers',
    shortLabel: 'Burgers',
    description: 'Carne sellada con borde crujiente en plancha de hierro y brioche tostado.',
  },
  {
    id: 'combos',
    label: 'Combos Tácticos',
    shortLabel: 'Combos',
    description: 'Burger + papas sazonadas + bebida con ahorro directo en MXN.',
  },
  {
    id: 'sides',
    label: 'Papas & Loot',
    shortLabel: 'Papas',
    description: 'Acompañamientos crujientes cargados con queso fundido y toppings.',
  },
  {
    id: 'drinks',
    label: 'Pociones & Shakes',
    shortLabel: 'Bebidas',
    description: 'Malteadas espesas y sodas artesanales bien frías.',
  },
  {
    id: 'sauces',
    label: 'Salsas Radiactivas',
    shortLabel: 'Salsas',
    description: 'Dips de la casa preparados a diario para sumergir cada bocado.',
  },
];

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  restaurantName: 'Slime Craft Burgers',
  whatsappNumber: '5215512345678',
  promoBannerText: 'NOCHE DE 2X1 ACTIVA — Combina dos platillos marcados 2X1 y el segundo sale gratis en tu carrito',
  promoActive: true,
  isOpen: true,
  prepTimeEstimate: '15–20 min',
};

const BURGER_EXTRAS = [
  { id: 'extra_patty', name: 'Carne Smash Extra (90g)', priceMxn: 48 },
  { id: 'extra_cheddar', name: 'Doble Queso Cheddar Fundido', priceMxn: 24 },
  { id: 'extra_bacon', name: 'Tocino Ahumado Crujiente', priceMxn: 32 },
  { id: 'extra_jalapeno', name: 'Aros de Jalapeño Frito', priceMxn: 22 },
  { id: 'extra_slime_sauce', name: 'Extra Salsa Slime Cilantro-Limón', priceMxn: 18 },
  { id: 'extra_onion_crunch', name: 'Cebolla Crispy Especial', priceMxn: 20 },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'slime-overlord-doble',
    name: 'Slime Overlord Doble',
    category: 'burgers',
    description:
      'Doble carne smash de res angus con borde crujiente, doble cheddar maduro, tocino ahumado, pepinillos encurtidos y nuestra salsa Slime de cilantro y jalapeño en brioche con ajonjolí.',
    priceMxn: 179,
    imageUrl: STUDIO_IMAGES.heroSmash,
    promoType: 'favorite',
    available: true,
    featured: true,
    caloriesLabel: 'Doble 180g',
    defaultIngredients: [
      'Salsa Slime cilantro-jalapeño',
      'Tocino ahumado',
      'Pepinillos encurtidos',
      'Cebolla morada',
      'Jitomate bola',
      'Lechuga fresca',
    ],
    extraOptions: BURGER_EXTRAS,
    sortOrder: 1,
  },
  {
    id: 'toxic-melt-triple',
    name: 'Toxic Melt Triple',
    category: 'burgers',
    description:
      'Tres carnes smash selladas al rojo vivo, capas alternadas de cheddar y pepper jack fundido, aros de jalapeño empanizados y lluvia de aioli verde ácido.',
    priceMxn: 215,
    imageUrl: STUDIO_IMAGES.toxicMelt,
    promoType: '2x1',
    available: true,
    featured: true,
    caloriesLabel: 'Triple 270g',
    defaultIngredients: [
      'Aros de jalapeño empanizado',
      'Queso pepper jack',
      'Cebolla morada encurtida',
      'Aioli verde cilantro-limón',
      'Cilantro fresco',
    ],
    extraOptions: BURGER_EXTRAS,
    sortOrder: 2,
  },
  {
    id: 'obsidian-bbq-crunch',
    name: 'Obsidian BBQ Crunch',
    category: 'burgers',
    description:
      'Doble smash glaseada en BBQ ahumado al chipotle, montaña de cebolla crispy dorada, tocino grueso caramelizado y cheddar fundido en pan brioche mantequilla.',
    priceMxn: 189,
    imageUrl: STUDIO_IMAGES.obsidianBbq,
    promoType: '2x1',
    available: true,
    featured: true,
    caloriesLabel: 'Doble 180g',
    defaultIngredients: [
      'Salsa BBQ chipotle ahumado',
      'Cebolla crispy dorada',
      'Tocino grueso',
      'Queso cheddar americano',
    ],
    extraOptions: BURGER_EXTRAS,
    sortOrder: 3,
  },
  {
    id: 'bedrock-classic-smash',
    name: 'Bedrock Classic Smash',
    category: 'burgers',
    description:
      'La esencia pura de la plancha: doble carne smash crujiente, doble queso americano fundido, cebolla picada sellada en carne, pepinillos y salsa secreta de la casa.',
    priceMxn: 155,
    imageUrl: STUDIO_IMAGES.heroSmash,
    promoType: '2x1',
    available: true,
    featured: false,
    caloriesLabel: 'Doble 180g',
    defaultIngredients: [
      'Salsa secreta de la casa',
      'Cebolla a la plancha',
      'Pepinillos',
      'Queso americano',
    ],
    extraOptions: BURGER_EXTRAS,
    sortOrder: 4,
  },
  {
    id: 'combo-squad-tactico',
    name: 'Combo Táctico Individual',
    category: 'combos',
    description:
      'Incluye Slime Overlord Doble o Bedrock Smash, papas sazonadas con especias de la casa, dip de salsa Slime y soda artesanal de limón con menta.',
    priceMxn: 239,
    originalPriceMxn: 285,
    imageUrl: STUDIO_IMAGES.tacticalCombo,
    promoType: 'combo',
    available: true,
    featured: true,
    caloriesLabel: 'Ahorra $46',
    defaultIngredients: [
      'Pepinillos en burger',
      'Salsa Slime en burger',
      'Sazonador especiado en papas',
      'Hielo y menta en soda',
    ],
    extraOptions: [
      { id: 'upgrade_loaded', name: 'Subir a Papas Radiactivas Loaded', priceMxn: 45 },
      { id: 'upgrade_shake', name: 'Cambiar Soda por Malteada Pistache', priceMxn: 52 },
      { id: 'extra_patty_combo', name: 'Carne Smash Extra en Burger', priceMxn: 48 },
    ],
    sortOrder: 5,
  },
  {
    id: 'combo-duo-raid',
    name: 'Combo Dúo Nocturno',
    category: 'combos',
    description:
      'Dos Smash Burgers a elegir (Obsidian BBQ + Slime Overlord), orden grande de Papas Radiactivas Loaded para compartir y dos sodas artesanales.',
    priceMxn: 449,
    originalPriceMxn: 530,
    imageUrl: STUDIO_IMAGES.tacticalCombo,
    promoType: 'combo',
    available: true,
    featured: false,
    caloriesLabel: 'Ahorra $81',
    defaultIngredients: [
      'Tocino en papas',
      'Jalapeños en papas',
      'Cebolla crispy en BBQ',
    ],
    extraOptions: [
      { id: 'extra_dip_pack', name: 'Trío de Salsas Radiactivas', priceMxn: 45 },
      { id: 'extra_patty_duo', name: 'Extra Carne Smash (1 pieza)', priceMxn: 48 },
    ],
    sortOrder: 6,
  },
  {
    id: 'papas-radiactivas-loaded',
    name: 'Papas Radiactivas Loaded',
    category: 'sides',
    description:
      'Papas doradas extra crujientes bañadas en queso cheddar caliente, trozos de tocino ahumado, rodajas de jalapeño encurtido y espiral de crema verde de hierbas.',
    priceMxn: 119,
    imageUrl: STUDIO_IMAGES.loadedFries,
    promoType: 'favorite',
    available: true,
    featured: true,
    caloriesLabel: 'Porción 320g',
    defaultIngredients: [
      'Queso cheddar líquido',
      'Tocino ahumado picado',
      'Jalapeños encurtidos',
      'Crema verde de cilantro',
    ],
    extraOptions: [
      { id: 'extra_cheese_fries', name: 'Doble Baño de Cheddar', priceMxn: 28 },
      { id: 'extra_bacon_fries', name: 'Doble Tocino Ahumado', priceMxn: 32 },
      { id: 'extra_smashed_beef', name: 'Carne Smash Picada Encima', priceMxn: 52 },
    ],
    sortOrder: 7,
  },
  {
    id: 'papas-obsidian-spec',
    name: 'Papas Sazonadas Obsidian',
    category: 'sides',
    description:
      'Corte delgado doble fritura con sal de ajo negro, paprika ahumada y perejil fresco. Acompañadas de un dip a elegir.',
    priceMxn: 75,
    imageUrl: STUDIO_IMAGES.loadedFries,
    promoType: '2x1',
    available: true,
    featured: false,
    caloriesLabel: 'Porción 220g',
    defaultIngredients: ['Sal de ajo negro', 'Paprika ahumada'],
    extraOptions: [
      { id: 'dip_cheddar', name: 'Dip de Queso Cheddar Caliente', priceMxn: 24 },
      { id: 'dip_slime', name: 'Dip Salsa Slime', priceMxn: 18 },
    ],
    sortOrder: 8,
  },
  {
    id: 'malteada-slime-pistache',
    name: 'Malteada Slime Pistache & Oreo',
    category: 'drinks',
    description:
      'Helado artesanal batido a mano con crema de pistache tostado, galleta de chocolate oscuro triturada, crema batida y reducción de pistache.',
    priceMxn: 109,
    imageUrl: STUDIO_IMAGES.slimeShake,
    promoType: 'favorite',
    available: true,
    featured: true,
    caloriesLabel: '450 ml',
    defaultIngredients: ['Crema batida', 'Galleta de chocolate', 'Sirope de pistache'],
    extraOptions: [
      { id: 'extra_oreo', name: 'Doble Galleta Triturada', priceMxn: 18 },
      { id: 'extra_pistachio', name: 'Extra Crema de Pistache', priceMxn: 24 },
    ],
    sortOrder: 9,
  },
  {
    id: 'pocion-lima-menta',
    name: 'Poción Lima-Menta Craft',
    category: 'drinks',
    description:
      'Soda gasificada al momento con jugo natural de limón verde, jarabe de hierbabuena fresca y mucho hielo cristalino.',
    priceMxn: 62,
    imageUrl: STUDIO_IMAGES.tacticalCombo,
    promoType: '2x1',
    available: true,
    featured: false,
    caloriesLabel: '500 ml',
    defaultIngredients: ['Hojas de menta', 'Rodaja de limón', 'Hielo'],
    extraOptions: [
      { id: 'extra_ginger', name: 'Toque de Jengibre Picante', priceMxn: 14 },
      { id: 'extra_mineral', name: 'Versión Sin Azúcar', priceMxn: 0 },
    ],
    sortOrder: 10,
  },
  {
    id: 'dip-slime-radiactivo',
    name: 'Dip Salsa Slime Cilantro-Jalapeño',
    category: 'sauces',
    description:
      'Nuestra emulsión verde insignia: cremosa, herbal y con picor medio balanceado con limón amarillo.',
    priceMxn: 25,
    imageUrl: STUDIO_IMAGES.toxicMelt,
    promoType: 'none',
    available: true,
    featured: false,
    caloriesLabel: '60 ml',
    defaultIngredients: [],
    extraOptions: [],
    sortOrder: 11,
  },
  {
    id: 'dip-bbq-chipotle',
    name: 'Dip BBQ Ahumado al Chipotle',
    category: 'sauces',
    description:
      'Reducción espesa de chile chipotle adobado, miel de piloncillo y toque ahumado de nogal.',
    priceMxn: 25,
    imageUrl: STUDIO_IMAGES.obsidianBbq,
    promoType: 'none',
    available: true,
    featured: false,
    caloriesLabel: '60 ml',
    defaultIngredients: [],
    extraOptions: [],
    sortOrder: 12,
  },
];
