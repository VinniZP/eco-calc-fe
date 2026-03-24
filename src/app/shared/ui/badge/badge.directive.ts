import { computed, Directive, input } from '@angular/core';

import { cn } from '../cn';
import { badge, type BadgeColor, type BadgeSize } from './badge.variants';

@Directive({
  selector: '[appBadge]',
  host: { '[class]': 'hostClass()' },
})
export class BadgeDirective {
  readonly color = input<BadgeColor>('neutral');
  readonly size = input<BadgeSize>('md');
  readonly class = input('');

  protected readonly hostClass = computed(() =>
    cn(badge({ color: this.color(), size: this.size() }), this.class()),
  );
}
