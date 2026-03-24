import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { cn } from '../cn';

type GroupSize = 'xs' | 'sm' | 'md';

const SIZE = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
} as const;

const BASE = 'inline-flex items-center justify-center font-medium transition-colors cursor-pointer rounded-none border-r border-base-content/20 last:border-r-0';

@Component({
  selector: 'app-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex [&>button]:rounded-none [&>button:first-child]:rounded-l [&>button:last-child]:rounded-r',
  },
  template: `
    @for (option of options(); track option) {
      <button
        type="button"
        [class]="optionClass(option)"
        (click)="value.set(option)">
        {{ option }}
      </button>
    }
  `,
})
export class ButtonGroupComponent {
  readonly options = input.required<(string | number)[]>();
  readonly size = input<GroupSize>('sm');
  readonly value = model<string | number>();

  private readonly baseClass = computed(() => cn(BASE, SIZE[this.size()]));

  optionClass(option: string | number): string {
    const isSelected = this.value() === option;
    return cn(
      this.baseClass(),
      isSelected
        ? 'bg-primary text-primary-content'
        : 'bg-base-200 text-base-content hover:bg-base-100',
    );
  }
}
