---
name: Toxic Slime Craft
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#4ae176'
  primary: '#4be277'
  on-primary: '#003915'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#006e2f'
  secondary: '#ffe083'
  on-secondary: '#3c2f00'
  secondary-container: '#eec200'
  on-secondary-container: '#645000'
  tertiary: '#ffb4ae'
  on-tertiary: '#68000a'
  tertiary-container: '#ff8a83'
  on-tertiary-container: '#860011'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system translates the explosive, late-night energy of toxic gamer culture and voxel survival aesthetics into an appetite-driven quick-service restaurant interface. It balances high-octane gaming nostalgia with seamless transactional clarity, evoking the adrenaline of an inventory full of hazardous power-ups alongside the irresistible craving for artisan smash burgers.

The target audience spans digital natives, gamers, streaming culture enthusiasts, and late-night foodies who appreciate irreverent culinary concepts. The interface evokes a sense of radioactive discovery: dark graphite depths punctuated by acid greens, hazard warnings, and clean geometric structures.

The visual execution combines High-Contrast Gamer Brutalism with refined UI ergonomics. Pixel-art bisecting hints and inventory-inspired structural grids meet polished dark-mode standards, ensuring every food description, nutritional note, and checkout tier remains instantly scannable without sacrificing thematic intensity.

## Colors

The palette is engineered for a dark environment where culinary visuals shine against obsidian canvas tones. 

- **Primary (`#22C55E` / Toxic Slime Green):** Acts as the radioactive core of the UI. Used for primary interactions, successful modifiers, active tabs, and primary action buttons.
- **Secondary (`#FACC15` / Hazard Yellow):** Directs attention to high-value alerts, limited-time drops, special ingredients, and warning banners.
- **Tertiary (`#EF4444` / Critical Damage Red):** Reserved for high-urgency notifications, 2-for-1 tactical promotions, combo badges, and destructive actions.
- **Neutral (`#18181B` / Obsidian Bedrock):** Establishes the surface architecture, varying from `#0D0D11` for canvas backdrops to `#27272A` for layered cards, dividers, and modular containers.

Color contrast strictly adheres to accessibility minimums. Interactive text on radioactive green surfaces switches to deep bedrock tones to preserve instant optical legibility.

## Typography

The typographic hierarchy divides computational geometry from effortless reading comfort.

- **Headlines & Badges (`Space Grotesk`):** Provides a sharp, tech-forward, blocky posture that mimics gaming HUD interfaces without losing commercial typographic balance. Headlines use tight line heights to project punchy authority across burger categories, combo callouts, and modular headers.
- **Body & Pricing (`Inter`):** Powers product compositions, ingredient disclaimers, customizations, and prices. The neutral grotesque rhythm maximizes readability in low-light environments, preventing eye fatigue during extensive menu exploration.
- **Labels & Tags:** Rendered in bold `Space Grotesk` in uppercase or structured title case to maintain the feel of inventory item classifications and hazard tier markings.

## Layout & Spacing

The layout model is governed by a 12-column responsive fluid grid configured for tactical inventory inspection.

- **Desktop (1024px+):** Employs a sticky sidebar category navigator on the left (spanning 3 columns) paired with a 9-column dynamic showcase of 2-to-3 column menu product grids. Gutter space is set to `1.5rem`, providing comfortable air between dense culinary elements.
- **Tablet (768px - 1023px):** Collapses the menu navigation into a horizontal sticky pill rack, shifting the card grid to a balanced 2-column inventory matrix with `1rem` gutters.
- **Mobile (<768px):** Refits the feed into a high-utility 1-column stack or 2-column compact carousel with `1rem` outer margins, ensuring full thumb-reach accessibility to addition buttons and customization drawers.

Vertical rhythm follows a strict 4px/8px modular cadence, keeping component padding dense, purposeful, and structured like a survival crafting hotbar.

## Elevation & Depth

Visual hierarchy does not rely on soft, realistic lighting; it utilizes low-contrast bedrock layering accented by toxic radioactive emissive glows.

- **Surface 0 (Deep Void):** `#0D0D11` acts as the unlit bedrock canvas.
- **Surface 1 (Inventory Slates):** `#18181B` provides standard container contrast for burger cards, item panels, and input fields. Outlined by subtle `#27272A` borders.
- **Surface 2 (Floating Equipment):** `#27272A` elevated for active modals, sticky bottom shopping carts, and expanded ingredient selectors.
- **Radiation Glow (Emissive Accents):** High-priority interactives and active states emit a neon bloom using colored box shadows (`0 0 16px rgba(34, 197, 94, 0.35)` for primary interactions and `0 0 16px rgba(239, 68, 68, 0.4)` for critical deals). 
- **Bevel Simulation:** Select elements use a subtle 1px dual border highlight (top-left inset in lighter zinc, bottom-right in deeper black) to evoke physical, tactile block construction.

## Shapes

The design system enforces a soft-cornered geometry (roundedness: 1) providing crisp, mechanical discipline that nods to voxel geometry without feeling crude or unfinished. 

Standard components utilize a tight `0.25rem` (4px) radius, preventing visual clutter when cards sit tightly in modular grids. Dialog panels, modals, and promotional hero banners scale to `rounded-lg` (`0.5rem`) and `rounded-xl` (`0.75rem`) to frame culinary hero photography gracefully.

Interactive tags mimic inventory hotbar slots with razor-precise proportions, straight edges, and controlled corners.

## Components

### Buttons
- **Primary ("Craft / Add"):** High-visibility `#22C55E` fill with `#0D0D11` bold text. Includes subtle square pixel-corner accents or beveled borders. Active state triggers a radioactive bloom.
- **Secondary ("Customize"):** Transparent fill with a 1.5px `#27272A` border, turning `#22C55E` on hover with crisp white text.
- **Danger / Promo ("2X1 Claim"):** `#EF4444` background with crisp white typography and a rhythmic hazard shimmer.

### Product Cards
- Built as modular Minecraft-inspired inventory blocks. Dark graphite background (`#18181B`) with high-resolution food photography framed in a square or 4:3 ratio.
- Top-right corner houses tactical badge chips (e.g., `#1 de tus favoritos`, `2X1`).
- Bottom row features concise pricing in `Inter` bold and a square high-contrast plus button (`+`) for rapid single-tap ordering.

### Chips & Filter Tags
- Horizontal scrollable filter bar styled as an inventory hotbar. Inactive chips use `#18181B` with muted slate text. Active chips snap to `#22C55E` fill or solid outline with Space Grotesk uppercase text.

### Input Fields & Search Bars
- Recessed surface styling (`#0D0D11`) with a `#27272A` outline. Focused inputs snap to a crisp `#22C55E` stroke with zero blur, accompanied by pixelated search icons and monospace placeholder text.

### Badges & Hazard Banners
- Ribbons and promo strips feature slanted diagonal warning stripes (`#FACC15` and `#0D0D11`) or glowing radioactive crimson containers (`#EF4444`) with high-contrast warning text.

### Cart & Modifier Modal
- Bottom sheet / side drawer configured like a crafting table. Ingredients and extra patties display as checkbox tiles with numeric counters (`[ - ] 01 [ + ]`), surrounded by block-molded segment lines.