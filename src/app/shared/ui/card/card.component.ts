import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { booleanAttribute } from '@angular/core';

import { cn } from '../cn';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
  template: `
    <div [class]="bodyClass()">
      <div class="text-lg font-semibold">
        <ng-content select="[card-title]" />
      </div>
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly compact = input(false, { transform: booleanAttribute });
  readonly shadow = input(true, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    cn(
      'rounded-lg bg-base-300',
      this.shadow() && 'shadow-xl',
    )
  );

  protected readonly bodyClass = computed(() =>
    cn(this.compact() ? 'p-3' : 'p-4 sm:p-6'),
  );
}
