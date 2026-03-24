# Lessons Learned

## Angular Directives: Consumer Class Merging

**Wrong**: `inject(ElementRef).nativeElement.getAttribute('class')` — DOM hacking at construction time, fragile, not reactive.

**Right**: `readonly class = input('')` — clean signal input. Consumers pass dynamic classes via `[class]="expr"`. Angular merges static `class="..."` with `[class]` host binding automatically.
