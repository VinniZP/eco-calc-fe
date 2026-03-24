# Dependency Modernization Plan: eco-calc-fe

> Angular 18 → 21, Tailwind 3 → 4, DaisyUI → CVA + Tailwind, Karma → Vitest, Zoneless, Signal Forms, Custom Select

## Current State (after Phase 11)

| Metric | Value |
|--------|-------|
| Angular | 21.2.5 |
| Initial bundle | 359 KB / 94.5 KB gzip |
| Tests | 2/2 passing |
| Build | Zero warnings |

## Completed Phases

- [x] **Phase 1**: Angular 18 → 19
- [x] **Phase 2**: Angular 19 → 20
- [x] **Phase 3**: Angular 20 → 21
- [x] **Phase 4**: Tailwind 3 → 4 + DaisyUI 4 → 5
- [x] **Phase 5A**: Build UI Kit (CVA + directives + components)
- [x] **Phase 5B**: Migrate templates from DaisyUI to UI Kit
- [x] **Phase 6**: Karma → Vitest
- [x] **Phase 7**: Zoneless migration
- [x] **Phase 7.5**: Lazy routes — initial bundle 784 KB → 537 KB
- [x] **Phase 8**: Signal Forms migration
- [x] **Phase 9**: ng-select → Custom ARIA Select
- [x] **Phase 10**: Cleanup (remove Material, animations, etc.)
- [x] **Phase 11**: Bundle optimization (CdkTable removal, custom tailwind-merge)

---

## Phase 12: Quick Wins — Dependency Cleanup & Code Quality

**Risk: LOW** | Small, safe changes

### 12A: Remove unused dependencies
- [ ] 12A.1 `npm uninstall @angular/platform-browser-dynamic` — not imported anywhere (standalone API)
- [ ] 12A.2 `npm uninstall ngxtension` — zero imports in src/
- [ ] 12A.3 Verify build + tests pass
- [ ] 12A.4 Commit

### 12B: Remove dead code & fix bugs
- [ ] 12B.1 Remove unused CVA exports from `shared/ui/index.ts` (`button`, `inputVariants`, `badge`, `TABLE_BASE`) — only directives use them internally
- [ ] 12B.2 Fix `card.component.ts` dead `compact` input — `cn(this.compact() ? 'p-2' : 'p-2')` both branches identical
- [ ] 12B.3 Fix `config.ts:97` — `getItemPrices(product: number)` param should be `string` (keys are strings)
- [ ] 12B.4 Remove empty `withHooks({ onInit() {}, onDestroy() {} })` in `config.ts`
- [ ] 12B.5 Remove unused `--color-secondary` and `--color-secondary-content` from `@theme` in `styles.css`
- [ ] 12B.6 Remove empty SCSS files (15 files have no content)
- [ ] 12B.7 Fix remaining DaisyUI classes in `skill-item.component.html` — `select select-bordered select-sm` → `appSelect`
- [ ] 12B.8 Verify build + tests pass
- [ ] 12B.9 Commit

### 12C: Fix array mutations in config store
- [ ] 12C.1 `config.ts:58-61` — replace `selected.splice(found, 1)` with `.filter()`
- [ ] 12C.2 `config.ts:68-74` — replace direct array index mutation with `.map()`
- [ ] 12C.3 `config.ts:86-88` — replace `enabled.splice(found, 1)` with `.filter()`
- [ ] 12C.4 Fix `!=` → `!==` comparison (line 59)
- [ ] 12C.5 Commit

---

## Phase 13: Type Safety — Eliminate `$any()` Casts

**Risk: LOW** | Template-only changes

10 `$any($event.target).value` / `.checked` casts across 6 files. Replace with type-safe event handler methods.

- [ ] 13.1 Create shared utility: `asInputValue(event: Event): string` and `asChecked(event: Event): boolean`
- [ ] 13.2 Migrate `recipes-list.component.html` (2 casts)
- [ ] 13.3 Migrate `skill-item.component.html` (2 casts)
- [ ] 13.4 Migrate `recipe-calculations.component.html` (2 casts)
- [ ] 13.5 Migrate `shops.component.html` (1 cast)
- [ ] 13.6 Migrate `offers.component.html` (2 casts)
- [ ] 13.7 Migrate `food-calc.component.html` (1 cast)
- [ ] 13.8 Verify build + tests pass
- [ ] 13.9 Commit

---

## Phase 14: Remove CDK — Native Dialog + CSS Popover

**Risk: MEDIUM** | Removes ~40-60 KB from bundle

### 14A: Replace CDK Dialog with native `<dialog>`
- [ ] 14A.1 Create `DialogService` — lightweight wrapper around native `<dialog>` with signal-based API, `open()`, `close(returnValue)`, focus trap
- [ ] 14A.2 Migrate `product-dialog` — replace `Dialog`/`DialogRef`/`DIALOG_DATA` with native dialog + inputs
- [ ] 14A.3 Migrate `shop-picker` — same pattern, preserve `DialogRef<number | null>` return value behavior
- [ ] 14A.4 Update `product-link.component.ts` and `ingredient-price.component.ts` (dialog invocation points)
- [ ] 14A.5 Remove dialog-manager factory functions (2 files)
- [ ] 14A.6 Verify dialog open/close, return values, focus management

### 14B: Replace CDK Overlay with Popover API + anchor positioning
- [ ] 14B.1 Migrate `select.component.ts` — replace `CdkConnectedOverlay`/`CdkOverlayOrigin` with `popover` attribute + CSS anchor positioning
- [ ] 14B.2 Migrate `multi-select.component.ts` — same pattern
- [ ] 14B.3 Handle outside click (backdrop), width matching, keyboard navigation
- [ ] 14B.4 Remove `@import "@angular/cdk/overlay-prebuilt.css"` from `styles.css`

### 14C: Cleanup
- [ ] 14C.1 `npm uninstall @angular/cdk`
- [ ] 14C.2 Verify build + tests pass
- [ ] 14C.3 Visual regression check on all select dropdowns and dialogs
- [ ] 14C.4 Commit

---

## Phase 15: Calculation Optimization

**Risk: MEDIUM** | Performance improvements, logic refactoring

### 15A: Use Set/Map for O(1) lookups (replaces O(n) array searches)
- [ ] 15A.1 `recipes.data-source.ts:31-48` — convert `table` and `profession` filter arrays to Sets; build `shopOffersByItem` Map for selling filter
- [ ] 15A.2 `recipes.ts:100-108` — return Maps from `recipesByProduct`/`ingredientInProduct` instead of arrays; replace `find()`/`findIndex()` with `Map.get()`
- [ ] 15A.3 `shops.ts:45-55` — combine `.some()` + `.filter()` double iteration into single pass
- [ ] 15A.4 `offers.component.ts:36-49` — pre-lowercase search string, combine dedup + filter into single pass

### 15B: Memoize expensive computations
- [ ] 15B.1 `food-calc.component.ts:161-187` — pre-build `offersByItemName` Map for `costPer1000Calories`; use Set for `filteredPrices`; cache number conversions
- [ ] 15B.2 `food-calc.component.ts:82-87` — replace `Object.assign({}, ...array.map(...))` with single `reduce()` or `Map`
- [ ] 15B.3 `food-calc.component.ts:135-155` — cache sorted offers instead of re-sorting per item in `customEatedByShop`
- [ ] 15B.4 `recipe-calculations.component.ts:93-183` — consolidate 5+ separate iterations over products into single pass

### 15C: Template optimizations
- [ ] 15C.1 Replace `track $index` with stable identifiers in 8+ `@for` loops (paginator, shop, offer, food-calc, donut)
- [ ] 15C.2 Move `uniqueRecipes` pipe to computed signal in `recipes-list.component.ts`
- [ ] 15C.3 Extract repeated `ingredient.name || getOverrideForTag(ingredient.tag)` to computed in recipe-calculations

### 15D: Verify
- [ ] 15D.1 Build + tests pass
- [ ] 15D.2 Commit

---

## Phase 16: Architecture — Data/UI Separation

**Risk: MEDIUM-HIGH** | Structural refactoring

### 16A: Extract business logic from components
- [ ] 16A.1 Extract `RecipeCalculationService` from `recipe-calculations.component.ts:93-183` — labor cost, ingredient cost, product distribution calculations
- [ ] 16A.2 Extract `FoodCalculatorService` from `food-calc.component.ts:263-487` — eating algorithms (`eatCalories`, `eatVariety`, `eatNutrition`, `eatBest`)
- [ ] 16A.3 Extract price parsing utility from `ingredient-price.component.ts:44-55`
- [ ] 16A.4 Move shop min-price computation from `shop-picker.component.ts:25-32` to `ShopsStore` method
- [ ] 16A.5 Move offer deduplication from `offers.component.ts:36-49` to `ShopsStore` computed

### 16B: Centralize persistence
- [ ] 16B.1 Create `PersistenceService` abstracting localStorage — handles debounced writes, hydration, type-safe keys
- [ ] 16B.2 Migrate `AppComponent` config persistence (currently un-debounced effect writing full store on every change)
- [ ] 16B.3 Migrate `RecipesListComponent` filter persistence
- [ ] 16B.4 Migrate `FoodCalcComponent` config persistence

### 16C: Consolidate effects
- [ ] 16C.1 `recipe-calculations.component.ts:207-257` — merge 3 interdependent effects (skill read/write + product settings) into single bidirectional sync effect with proper debounce
- [ ] 16C.2 `food-calc.component.ts:191-233` — consolidate multiple unrelated constructor effects; remove `untracked()` calls by restructuring dependency graph
- [ ] 16C.3 `prices-settings.component.ts:30-46` — fix bidirectional form↔store sync (two effects creating ping-pong)

### 16D: Verify
- [ ] 16D.1 Build + tests pass
- [ ] 16D.2 Commit

---

## Phase 17: Error Handling & Resilience

**Risk: LOW-MEDIUM** | Safety improvements

- [ ] 17.1 Add `catchError` with fallback to `FoodService`, `ItemsService`, `RecipesService`, `ShopsService` (currently only `UserService` handles errors)
- [ ] 17.2 Add global HTTP error interceptor for toast notifications on 4xx/5xx
- [ ] 17.3 Add `takeUntilDestroyed()` to unmanaged subscriptions in `AppComponent:40-47` and `OffersComponent:71`
- [ ] 17.4 Expose loading signals from services for proper UI feedback
- [ ] 17.5 Consider lazy data loading per route instead of loading all 4 services on app startup (`AppComponent:40-47` blocks render waiting for all endpoints)
- [ ] 17.6 Verify build + tests pass
- [ ] 17.7 Commit

---

## Phase 18: Accessibility

**Risk: LOW** | Template-only changes

- [ ] 18.1 Add `aria-label` to toggle directive and loading component
- [ ] 18.2 Add `for` attribute to form-field labels (currently unassociated)
- [ ] 18.3 Add `aria-label` to icon-only buttons (close button in product-dialog, chevron SVGs in selects)
- [ ] 18.4 Add arrow key navigation to `ButtonGroupComponent`
- [ ] 18.5 Replace clickable `<div>` with `<button>` in `recipe-calculations.component.html:159-165`
- [ ] 18.6 Add `aria-label` to search inputs that only have placeholder text
- [ ] 18.7 Commit

---

## Phase 19: Test Coverage

**Risk: LOW** | Only 2 spec files exist

- [ ] 19.1 Add unit tests for signal stores (RecipesStore computeds, ShopsStore methods, UserConfigStore methods)
- [ ] 19.2 Add unit tests for recipe calculation logic (after Phase 16A extraction)
- [ ] 19.3 Add unit tests for food calculator algorithms (after Phase 16A extraction)
- [ ] 19.4 Add component tests for Select/MultiSelect keyboard navigation
- [ ] 19.5 Add component tests for Dialog open/close/return value flow

---

## Priority Matrix

| Phase | Impact | Effort | Risk | Bundle Savings |
|-------|--------|--------|------|----------------|
| **12: Quick Wins** | Medium | Low | Low | ~2-3 KB |
| **13: Type Safety** | Medium | Low | Low | 0 |
| **14: Remove CDK** | High | Medium | Medium | ~40-60 KB |
| **15: Calc Optimization** | High | Medium | Medium | 0 (perf only) |
| **16: Architecture** | High | High | Medium-High | 0 (maintainability) |
| **17: Error Handling** | Medium | Low | Low | 0 |
| **18: Accessibility** | Medium | Low | Low | 0 |
| **19: Test Coverage** | Medium | Medium | Low | 0 |

**Recommended order:** 12 → 13 → 14 → 15 → 17 → 18 → 16 → 19
(Do 16 after 15 since extracted services benefit from optimization done first)
