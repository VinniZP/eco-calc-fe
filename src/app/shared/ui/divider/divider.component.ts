import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { cn } from '../cn';

@Component({
  selector: 'app-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[class]': 'hostClass()',
  },
  template: '',
})
const SPACING = { none: 'my-0', sm: 'my-1', md: 'my-2' } as const;

export class DividerComponent {
  readonly spacing = input<'none' | 'sm' | 'md'>('md');

  protected readonly hostClass = computed(() =>
    cn('block border-t border-base-content/10 w-full', SPACING[this.spacing()]),
  );
}
