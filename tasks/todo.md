# Dependency Modernization Plan: eco-calc-fe

> Angular 18 → 21, Tailwind 3 → 4, DaisyUI → CVA + Tailwind, Karma → Vitest, Zoneless, Signal Forms, Custom Select

## Current State (after Phase 6)

| Package | Before | Now | Target |
|---------|--------|-----|--------|
| @angular/* | 18.2.3 | **21.2.5** | 21.x |
| TypeScript | 5.5.3 | **5.9.3** | 5.9.x |
| @ngrx/signals | 18.0.2 | **21.0.1** | 21.x |
| ngxtension | 4.0.0 | **7.2.0** | 7.x |
| @ng-select/ng-select | 13.4.1 | **Removed → @angular/aria** | **Remove** |
| @ngneat/helipopper | 9.2.1 | **11.1.4** | 12.x |
| tailwindcss | 3.4.6 | **4.2.2** | 4.x |
| daisyui | 4.12.10 | **5.5.19** | **Remove** |
| @angular/cdk (table) | used | **Removed** | Remove (overlay/dialog still used) |
| tailwind-merge | default | **custom config** | Minimal class groups only |
| class-variance-authority | — | — | **Add** |
| Karma + Jasmine | 6.4.0 | **Removed → Vitest** | Remove (→ Vitest) |
| zone.js | 0.14.10 | **Removed → zoneless** | Remove (→ zoneless) |
| ReactiveFormsModule | used | **Removed** | Remove (→ Signal Forms) |
| FormsModule (ngModel) | used | **ng-select only** | Remove (→ Signal Forms) |
| rxjs | 7.8.0 | 7.8.0 | 7.8.2 |

## Progress

- [x] **Phase 1**: Angular 18 → 19 (`1dea365`)
- [x] **Phase 2**: Angular 19 → 20 (`0b087b9`)
- [x] **Phase 3**: Angular 20 → 21 (`f42cc5e`)
- [x] **Phase 4**: Tailwind 3 → 4 + DaisyUI 4 → 5 (`b4d8e59`)
- [x] **Phase 5A**: Build UI Kit (CVA + directives + components) (`30bef85`)
- [x] **Phase 5B**: Migrate templates from DaisyUI to UI Kit (`7c8182b`)
- [x] **Phase 6**: Karma → Vitest
- [x] **Phase 7**: Zoneless migration
- [x] **Phase 7.5**: Lazy routes — initial bundle 784 KB → 537 KB
- [x] **Phase 8**: Signal Forms migration
- [x] **Phase 9**: ng-select → Custom ARIA Select
- [x] **Phase 10**: Cleanup (remove Material, animations, etc.)

## Notable changes made during Phases 1-4

- Removed `standalone: true` from all 21 components (Angular 19 default)
- Removed deprecated `allowSignalWrites: true` from 6 effects
- Added `provideTippyLoader`/`provideTippyConfig` (helipopper v11 requirement)
- Migrated `moduleResolution` from `"node"` to `"bundler"` (Angular 20 migration)
- Auto-migrated remaining `*ngIf`/`*ngFor` to block control flow (Angular 21 migration)
- Migrated `:host { @apply ... }` to Angular `host: { class: '...' }` bindings
- Replaced SCSS `@apply` with `!important` hacks with plain CSS vars in global styles
- Deleted `tailwind.config.js`, added `.postcssrc.json` for Tailwind v4
- Custom dark theme via `:root` CSS variable overrides on DaisyUI 5's `dark` base theme

---

## Phase 5A: Build UI Kit (Components + Directives + CVA)

**Risk: LOW** | No templates changed yet — just creating the kit

### What changes
- Install `class-variance-authority`, `tailwind-merge`, `clsx`
- Create `cn()` utility (shadcn pattern: `clsx` + `tailwind-merge`)
- Build reusable Angular components and directives backed by CVA
- Define design tokens via Tailwind `@theme`
- Everything in `src/app/shared/ui/`

### Design tokens (`@theme` block in `src/styles.css`)

Replace DaisyUI semantic colors with custom Tailwind tokens:
```
--color-base-100/200/300    (surface hierarchy)
--color-primary/secondary/accent/neutral
--color-info/success/warning/error
--color-base-content/neutral-content/primary-content
```

### UI Kit architecture

```
src/app/shared/ui/
├── cn.ts                          // cn() utility: clsx + tailwind-merge
│
├── button/
│   ├── button.variants.ts         // CVA: intent (primary|ghost|outline|warning|accent|success|link), size (xs|sm|md), shape (default|circle)
│   └── button.directive.ts        // appButton directive: [appButton]="{intent, size}" → applies CVA classes to host
│
├── input/
│   ├── input.variants.ts          // CVA: size (xs|sm|md), bordered (bool), error (bool)
│   └── input.directive.ts         // appInput directive: [appInput]="{size}" [error]="bool" → applies to <input>
│
├── badge/
│   ├── badge.variants.ts          // CVA: color (neutral|success|error|info), size (xs|sm|md)
│   └── badge.directive.ts         // appBadge directive
│
├── card/
│   └── card.component.ts          // Component: <app-card [compact]="bool"> with ng-content, handles card/card-body/card-title
│
├── table/
│   ├── table.variants.ts          // CVA: zebra (bool), size (compact|sm|md), bordered (bool)
│   └── table.directive.ts         // appTable directive: applies to <table>
│
├── toggle/
│   └── toggle.directive.ts        // appToggle directive: applies custom toggle styles to <input type="checkbox">
│
├── button-group/
│   └── button-group.component.ts  // Component: <app-button-group> wrapping join-item radio buttons
│
├── divider/
│   └── divider.component.ts       // Component: <app-divider [spacing]="'sm'|'md'|'none'">
│
├── loading/
│   └── loading.component.ts       // Component: <app-loading> full-screen overlay with spinner
│
├── navbar/
│   └── navbar.component.ts        // Component: <app-navbar> with ng-content for links
│
└── form-field/
    └── form-field.component.ts    // Component: <app-form-field [label]="string"> wrapping form-control layout
```

### Design principles

1. **Three layers, each independently usable**:
   - **CVA functions** — pure functions, no Angular dependency. Can be called anywhere: templates, computed(), tests.
   - **Directives** — reactive wrappers that compute classes from signal inputs and apply to host. Always re-export the CVA function.
   - **Components** — only when you need template structure (ng-content slots, projected layout).

2. **Directives augment, never replace** the host element:
   - Selector restricts to correct element: `button[appButton], a[appButton]` — not bare `[appButton]`
   - Consumer `class="w-full mt-2"` merges cleanly via `cn()` — directive never stomps user classes
   - Angular merges `host: { '[class]': 'expr' }` with static `class` attributes automatically

3. **Boolean inputs use `booleanAttribute` transform** — attribute-only syntax works:
   ```html
   <input appInput bordered />          <!-- bordered = true -->
   <table appTable zebra bordered />    <!-- both true -->
   ```

4. **Every input has a sensible default** — bare directive works with zero config:
   ```html
   <button appButton>Submit</button>    <!-- intent='primary', size='md' -->
   ```

5. **CVA functions are always exported** — consumers can bypass the directive when they need to:
   ```typescript
   // In a computed() or template
   btnClass = computed(() => button({ intent: 'ghost', size: 'sm' }));
   ```

### Layer 1: `cn()` utility (shadcn pattern)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

`cn()` solves the class conflict problem: `cn('px-4 py-2', 'px-6')` → `'px-6 py-2'`. Used in every CVA function and directive.

### Layer 2: CVA functions

Pure variant maps. No Angular imports. Each lives in `*.variants.ts`:

```typescript
// button.variants.ts
export const button = cva(
  'inline-flex items-center justify-center font-medium transition-colors cursor-pointer
   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
   disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      intent: {
        primary:  'bg-primary text-primary-content hover:bg-primary/80',
        ghost:    'bg-transparent hover:bg-base-200',
        outline:  'border border-current bg-transparent hover:bg-base-200',
        warning:  'bg-warning text-warning-content hover:bg-warning/80',
        // ...
      },
      size: {
        xs: 'h-6 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-sm rounded',
        md: 'h-10 px-4 text-base rounded-lg',
      },
      shape: {
        default: '',
        circle: '!rounded-full !p-0 aspect-square',
      },
    },
    defaultVariants: { intent: 'primary', size: 'md', shape: 'default' },
  }
);
```

### Layer 3: Directives

Reactive wrappers. Each input is a standalone signal input. `computed()` derives the class string. Host binding applies it.

```typescript
// button.directive.ts
@Directive({ selector: 'button[appButton], a[appButton]' })
export class ButtonDirective {
  readonly intent = input<ButtonIntent>('primary');
  readonly size = input<ButtonSize>('md');
  readonly shape = input<'default' | 'circle'>('default');
  readonly active = input(false, { transform: booleanAttribute });

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  // Consumer classes from the static class="" attribute
  private readonly userClasses = this.el.nativeElement.getAttribute('class') ?? '';

  readonly hostClass = computed(() => cn(
    button({ intent: this.intent(), size: this.size(), shape: this.shape() }),
    this.active() && 'ring-2 ring-primary/50',
    this.userClasses,
  ));

  host: { '[class]': 'hostClass()' }
}
```

**Selector design rationale:**
| Directive | Selector | Why |
|-----------|----------|-----|
| `ButtonDirective` | `button[appButton], a[appButton]` | Only on clickable elements — preserves native semantics |
| `InputDirective` | `input[appInput]` | Only on `<input>` — never on textarea/select |
| `BadgeDirective` | `[appBadge]` | Any inline element — `<span>`, `<div>`, etc. |
| `TableDirective` | `table[appTable]` | Only on `<table>` — child `td`/`th` styled via CSS descendant selectors |
| `ToggleDirective` | `input[type="checkbox"][appToggle]` | Restrict to checkboxes only |

### Layer 4: Components (structural)

Only when `ng-content` / template structure is needed. Minimal — most are thin wrappers.

**Card** — needs title/body structure:
```html
<app-card [compact]="true">
  <span card-title>Settings</span>
  <!-- body content projected into card-body div -->
</app-card>
```
Internally: renders `<div class="rounded-lg bg-base-300 shadow-xl">` + `<div class="p-4">` for body, optional title.

**FormField** — label + control layout:
```html
<app-form-field label="Margin">
  <input appInput size="sm" bordered />
</app-form-field>
```
Internally: `flex items-center justify-between gap-2` wrapper with label on left, projected content on right.

**ButtonGroup** — join group for radio-style selectors:
```html
<app-button-group [(value)]="craftAmount" [options]="[1, 10, 100]" size="sm" />
```
Signal model input. Renders joined buttons internally. No ng-content needed — data-driven.

**Divider** — thin horizontal rule:
```html
<app-divider spacing="sm" />
```

**Loading** — full-screen overlay:
```html
@if (loading()) { <app-loading /> }
```

### Table styling strategy

The `TableDirective` applies classes to `<table>`. Child elements (`th`, `td`, `tr`) are styled via **CSS descendant selectors** in a small stylesheet, not via additional directives:

```css
/* table.styles.css — loaded by TableDirective */
table[appTable] th { @apply px-3 py-2 text-left text-sm font-semibold; }
table[appTable] td { @apply px-3 py-2 text-sm; }
table[appTable][data-zebra] tr:nth-child(even) { @apply bg-base-200/50; }
table[appTable][data-bordered] { @apply border border-base-300; }
```

This avoids directive-per-cell overhead. The `zebra`/`bordered` boolean inputs set `data-*` attributes on the host for CSS targeting.

### File structure

```
src/app/shared/ui/
├── cn.ts                              // cn() utility
├── button/
│   ├── button.variants.ts             // CVA function + types
│   └── button.directive.ts            // ButtonDirective
├── input/
│   ├── input.variants.ts
│   └── input.directive.ts
├── badge/
│   ├── badge.variants.ts
│   └── badge.directive.ts
├── table/
│   ├── table.variants.ts
│   ├── table.directive.ts
│   └── table.styles.css               // descendant selectors for th/td/tr
├── toggle/
│   └── toggle.directive.ts            // self-contained, no CVA needed (single variant)
├── card/
│   └── card.component.ts              // inline template
├── form-field/
│   └── form-field.component.ts        // inline template
├── button-group/
│   └── button-group.component.ts      // inline template, data-driven
├── divider/
│   └── divider.component.ts           // inline template
├── loading/
│   └── loading.component.ts           // inline template
└── index.ts                           // barrel export
```

### Steps

- [x] 5A.1 `npm i class-variance-authority tailwind-merge clsx`
- [x] 5A.2 Create `cn.ts` utility
- [ ] 5A.3 Define design tokens in `@theme` block (colors, radii, sizing to match current DaisyUI look)
- [x] 5A.4 Create `button.variants.ts` + `ButtonDirective`
  - Variants: intent (primary|ghost|outline|warning|accent|success|link), size (xs|sm|md), shape (default|circle)
  - Conditional: active, disabled states
- [x] 5A.5 Create `input.variants.ts` + `InputDirective`
  - Variants: size (xs|sm|md), bordered (bool)
  - Input: `[error]` for validation state
- [x] 5A.6 Create `badge.variants.ts` + `BadgeDirective`
  - Variants: color (neutral|success|error|info), size (xs|sm|md)
- [x] 5A.7 Create `table.variants.ts` + `TableDirective`
  - Variants: zebra (bool), size (compact|sm|md), bordered (bool)
- [x] 5A.8 Create `ToggleDirective` — custom checkbox toggle styling
- [x] 5A.9 Create `CardComponent` — `<app-card>` with title slot and body layout
- [x] 5A.10 Create `FormFieldComponent` — `<app-form-field [label]>` inline layout wrapper
- [x] 5A.11 Create `ButtonGroupComponent` — `<app-button-group>` for radio-style join groups
- [x] 5A.12 Create `DividerComponent` — `<app-divider [spacing]>`
- [x] 5A.13 Create `LoadingComponent` — `<app-loading>` full-screen overlay
- [x] 5A.14 Create `NavbarComponent` — `<app-navbar>` with content projection
- [x] 5A.15 `ng build` — verify kit compiles (no templates changed yet)
- [x] 5A.16 Commit: `feat: add UI kit with CVA components and directives` (`30bef85`)

---

## Phase 5B: Migrate templates from DaisyUI to UI Kit

**Risk: HIGH** | Every template touched — visual regressions possible

### What changes
- Replace all DaisyUI classes in templates with UI kit directives/components
- Remove `@plugin "daisyui"` and `npm uninstall daisyui`
- Remove ng-select DaisyUI-themed CSS overrides

### DaisyUI usage to replace (by template)

| Template | DaisyUI patterns | UI kit replacements |
|----------|-----------------|---------------------|
| `app.component.html` | navbar, btn-ghost, btn-primary, loading | `<app-navbar>`, `appButton`, `<app-loading>` |
| `recipes-list.component.html` | table-zebra, input-bordered, btn-outline, form-control | `appTable`, `appInput`, `appButton`, `<app-form-field>` |
| `recipe-calculations.component.html` | join/join-item, btn-outline, badge, toggle, form-control, table | `<app-button-group>`, `appButton`, `appBadge`, `appToggle`, `<app-form-field>`, `appTable` |
| `food-calc.component.html` | card, btn-warning/primary/accent/success, input-bordered, toggle, badge, divider, form-control | `<app-card>`, `appButton`, `appInput`, `appToggle`, `appBadge`, `<app-divider>`, `<app-form-field>` |
| `product-dialog.component.html` | btn-circle, badge, divider | `appButton`, `appBadge`, `<app-divider>` |
| `offers.component.html` | card, input-bordered, toggle, table-zebra | `<app-card>`, `appInput`, `appToggle`, `appTable` |
| `shops.component.html` | card, input-bordered, divider | `<app-card>`, `appInput`, `<app-divider>` |
| `shop.component.html` | table-compact | `appTable` |
| `offer.component.html` | table-zebra-md | `appTable` |
| `shop-picker.component.html` | table-bordered, divider | `appTable`, `<app-divider>` |
| `prices-settings.component.html` | card, input-bordered, form-control | `<app-card>`, `appInput`, `<app-form-field>` |
| `player-settings-card.component.html` | card, divider | `<app-card>`, `<app-divider>` |
| `recipes-card.component.html` | card, divider | `<app-card>`, `<app-divider>` |
| `skill-item.component.html` | select, toggle, form-control | native select (CVA), `appToggle`, `<app-form-field>` |
| `ingredient-price.component.html` | input-xs | `appInput` |
| `product-link.component.html` | btn-outline (conditional btn-warning) | `appButton` |
| `profession-line.component.html` | btn-outline | `appButton` |
| `paginator.component.html` | btn (conditional btn-active, btn-disabled) | `appButton` |
| `simplified-calc.component.html` | (layout only, no DaisyUI) | No change |

### Steps

- [x] 5B.1 Migrate `app.component.html` — navbar, loading, nav buttons
- [x] 5B.2 Migrate `recipes-list.component.html` — table, inputs, buttons, form controls
- [x] 5B.3 Migrate `recipe-calculations.component.html` — join groups, badges, toggles, buttons, tables
- [x] 5B.4 Migrate `food-calc.component.html` — cards, buttons, inputs, toggles, badges, dividers
- [x] 5B.5 Migrate `product-dialog.component.html` — close button, badges, dividers
- [x] 5B.6 Migrate `offers.component.html` + `offer.component.html` — cards, inputs, toggles, tables
- [x] 5B.7 Migrate `shops.component.html` + `shop.component.html` — cards, inputs, tables
- [x] 5B.8 Migrate `shop-picker.component.html` — table, dividers
- [x] 5B.9 Migrate `prices-settings.component.html` — card, inputs, form fields
- [x] 5B.10 Migrate `player-settings-card.component.html` + `skill-item.component.html` — cards, selects, toggles
- [x] 5B.11 Migrate `recipes-card.component.html` — card, divider
- [x] 5B.12 Migrate remaining: `ingredient-price`, `product-link`, `profession-line`, `paginator`
- [x] 5B.13 Remove `@plugin "daisyui"`, rename `styles.scss` → `styles.css`, add `@theme` design tokens
- [x] 5B.14 `npm uninstall daisyui`
- [x] 5B.15 Kept ng-select CSS overrides (still needed until Phase 9 removes ng-select)
- [x] 5B.16 `ng build` — passes
- [x] 5B.17 `ng serve` — visual regression check passed (food, calc, shops pages verified)
- [x] 5B.18 Commit: `feat: migrate all templates from DaisyUI to UI kit` (`7c8182b`)

---

## Phase 6: Karma → Vitest

**Risk: LOW** (only 2 test files exist)

### Steps
- [x] 6.1 Manual migration (schematic not available): install `vitest` + `jsdom`, switch builder to `@angular/build:unit-test`
- [x] 6.2 Remove Karma/Jasmine devDependencies (`karma`, `karma-*`, `jasmine-core`, `@types/jasmine`)
- [x] 6.3 Update `tsconfig.spec.json` — replace `jasmine` types with `vitest/globals`
- [x] 6.4 Update spec files — add required inputs for `OfferComponent`, mock `IntersectionObserver` for `OffersComponent`
- [x] 6.5 `ng test` — both tests pass
- [x] 6.6 Also migrated build builder from `@angular-devkit/build-angular:application` to `@angular/build:application`
- [x] 6.7 Commit: `chore: migrate from Karma to Vitest`

---

## Phase 7: Zoneless Migration

**Risk: LOW-MEDIUM**

### Steps
- [x] 7.1 Add `ChangeDetectionStrategy.OnPush` to all 22 components missing it
- [x] 7.2 Replace `provideZoneChangeDetection()` with `provideZonelessChangeDetection()` in `main.ts`
- [x] 7.3 Remove `zone.js` from polyfills in `angular.json`
- [x] 7.4 Remove `zone.js` dependency (already absent from package.json)
- [x] 7.5 Build passes — bundle reduced 821 KB → 784 KB (-37 KB)
- [x] 7.6 Tests pass
- [x] 7.7 Commit: `chore: migrate to zoneless change detection`

---

## Phase 8: Signal Forms Migration

**Risk: MEDIUM** | API is experimental in Angular 21

### Current forms inventory

**Reactive Forms — 3 components:**

| Component | Controls | Validation | Persistence |
|-----------|----------|------------|-------------|
| `RecipesListComponent` | search, table[], profession[], selling | None | localStorage |
| `FoodCalcComponent` | minTestiness, minCalories, minNutrients, availableInStore | `required`, `pattern` | localStorage |
| `PricesSettingsComponent` | caloriesCost, margin | `required`, `pattern` | userConfigStore |

**Template-Driven (ngModel) — 5 components:**

| Component | Controls | Notes |
|-----------|----------|-------|
| `RecipeCalculationsComponent` | craftAmount, module, level, margin, lavish, priceOverride | Already signals internally |
| `SkillItemComponent` | skill level, lavish checkbox | Simple binding |
| `OffersComponent` | search, filter | Simple text |
| `ShopsComponent` | search filter | Simple text |
| `PlayerSettingsCardComponent` | skill select | Add-to-list |

### Steps
- [x] 8.1 Migrate `PricesSettingsComponent` — FormGroup → Signal Forms (`form()` + `[formField]` + `pattern`/`required` validators)
- [x] 8.2 Migrate `FoodCalcComponent` — FormGroup → Signal Forms + `[ngModel]` for ng-select
- [x] 8.3 Migrate `RecipesListComponent` — FormGroup → plain signal + effects for localStorage/filter sync
- [x] 8.4 Migrate `OffersComponent` — `[(ngModel)]` → native `[value]`/`(input)` event bindings
- [x] 8.5 Migrate `ShopsComponent` — `[(ngModel)]` → native event bindings
- [x] 8.6 Migrate `SkillItemComponent` — `[(ngModel)]` → native event bindings
- [x] 8.7 `RecipeCalculationsComponent` + `PlayerSettingsCardComponent` — keep FormsModule for ng-select (Phase 9)
- [x] 8.8 Removed `ReactiveFormsModule` from all components. `FormsModule` remains only for ng-select bindings.
- [x] 8.9 Deleted unused `syncFormToLocalStorage` helper + empty `core/helpers` directory
- [x] 8.10 Build + tests pass
- [x] 8.11 Commit: `feat: migrate forms to Signal Forms and native bindings`

---

## Phase 9: Replace ng-select with Custom ARIA Select

**Risk: MEDIUM-HIGH** | Most labor-intensive phase

### ng-select inventory (8 usages)

| # | Component | Type | Search | Virtual Scroll | Data |
|---|-----------|------|--------|----------------|------|
| 1 | `TagPickerComponent` | Single | No | No | Item names |
| 2 | `RecipesListComponent` (profession) | **Multi** | No | No | Skills |
| 3 | `RecipesListComponent` (table) | **Multi** | No | No | Tables |
| 4 | `ProductDialogComponent` | Single | Yes | No | Recipes |
| 5 | `RecipeCalculationsComponent` | Single | No | No | Levels 1-7 |
| 6 | `FoodCalcComponent` | Single | No | No | Tastiness |
| 7 | `PlayerSettingsCardComponent` | Single | Yes | No | Skills |
| 8 | `RecipesCardComponent` | Single | Yes | **Yes** | Recipes |

### Steps
- [x] 9.1 Create `SelectDirective` (native `<select>` styling), `SelectComponent` (custom dropdown with @angular/aria), `MultiSelectComponent` (multi-select with checkboxes)
- [x] 9.2 Migrate RecipeCalculations (levels) → native `<select appSelect>`
- [x] 9.3 Migrate FoodCalc (tastiness) → native `<select appSelect>`
- [x] 9.4 Migrate TagPicker → `<app-select>` with clearable
- [x] 9.5 Migrate ProductDialog → `<app-select>` with search + custom option template
- [x] 9.6 Migrate PlayerSettings → `<app-select>` with search
- [x] 9.7 Migrate RecipesCard → `<app-select>` with search
- [x] 9.8 Migrate RecipesList (2x) → `<app-multi-select>` with checkbox options
- [x] 9.9 `npm uninstall @ng-select/ng-select`, remove all ng-select CSS overrides
- [x] 9.10 Remove FormsModule from all components (fully eliminated)
- [x] 9.11 Build + tests pass
- [x] 9.12 Commit: `feat: replace ng-select with custom ARIA select components`

---

## Phase 10: Cleanup

- [x] 10.1 Replace `MatSnackBar` with signal-based `ToastService` (2 usages)
- [x] 10.2 Remove `@angular/material` package
- [x] 10.3 Remove `@angular/animations` + `provideAnimationsAsync()`
- [x] 10.4 Remove prebuilt Material theme from `angular.json`
- [x] 10.5 Remove `useDefineForClassFields: false` and `experimentalDecorators: true` from tsconfig
- [x] 10.6 Bump `rxjs` to `~7.8.2`
- [x] 10.7 Final build — **496 KB initial (under 500 KB budget!)**, zero warnings
- [x] 10.8 Tests pass
- [x] 10.9 Commit: `chore: remove Angular Material, cleanup config`

---

## Phase 11: Bundle Optimization

- [x] 11.1 Remove CdkTable from recipes-list — replaced with plain `@for` table (CdkRecycleRows was deprecated/no-op, no CDK features were used)
- [x] 11.2 Replace default `twMerge` with `createTailwindMerge` custom config — only spacing, sizing, colors, border-radius, ring, shadow class groups
- [x] 11.3 Build verified — **359 KB raw / 94.3 KB gzipped initial** (down from 389 KB / 101.1 KB)
- [x] 11.4 Commit: `perf: remove CdkTable, use custom tailwind-merge config`

### Savings breakdown
| Change | Raw | Gzipped |
|--------|-----|---------|
| CdkTable removal | -30.3 kB | ~-8 kB |
| tailwind-merge custom config | -19.8 kB | ~-5 kB |
| **Total** | **-50.1 kB** | **~-13 kB** |

---

## Final Dependency Target

```
dependencies:
  @angular/common, compiler, core, forms, platform-browser, router  ^21.x
  @ngrx/signals          ^21.x
  @ngneat/helipopper     ^12.x
  ngxtension             ^7.x
  rxjs                   ~7.8.2
  tslib                  ^2.x

devDependencies:
  @angular/build         ^21.x
  @angular/cli           ^21.x
  @angular/compiler-cli  ^21.x
  class-variance-authority ^0.x
  prettier               ^3.x
  prettier-plugin-organize-imports ^4.x
  tailwindcss            ^4.x
  typescript             ~5.9.x

removed:
  @angular/animations, @angular/cdk, @angular/material
  @angular/platform-browser-dynamic
  @ng-select/ng-select
  autoprefixer, postcss
  daisyui
  jasmine-core, @types/jasmine
  karma + all karma-*
  zone.js
```
