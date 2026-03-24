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
      <div class="text-sm font-semibold text-base-content/70 mb-1">
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
      'rounded-xl bg-base-300 border border-base-content/[0.06]',
      this.shadow() && 'shadow-lg shadow-black/20',
    )
  );

  protected readonly bodyClass = computed(() =>
    cn(this.compact() ? 'p-2' : 'p-4'),
  );
}
