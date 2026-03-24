# Lessons Learned

## Angular Directives: Consumer Class Merging

**Wrong**: `inject(ElementRef).nativeElement.getAttribute('class')` — DOM hacking at construction time, fragile, not reactive.

**Right**: `readonly class = input('')` — clean signal input. Consumers pass dynamic classes via `[class]="expr"`. Angular merges static `class="..."` with `[class]` host binding automatically.

## Tailwind v4 `@theme` + Angular SCSS

**Problem**: `@theme { ... }` in a `.scss` file gets processed by Sass before PostCSS/Tailwind. Although Sass passes unknown at-rules through, the Angular build pipeline's Sass-then-PostCSS ordering can cause `@theme` to not be processed by Tailwind correctly.

**Fix**: Rename global styles from `.scss` to `.css` when using Tailwind v4's `@theme`. Update `angular.json` to reference the `.css` file. Flatten any Sass-only syntax (`&:hover` nesting → full selectors).
