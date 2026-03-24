import { computed, Directive, input } from '@angular/core';

import { cn } from '../cn';

const TOGGLE_BASE =
  'appearance-none relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-base-content/20 transition-colors checked:bg-primary after:absolute after:left-0 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform checked:after:translate-x-5';

@Directive({
  selector: 'input[type="checkbox"][appToggle]',
  host: {
    type: 'checkbox',
    '[class]': 'hostClass()',
  },
})
export class ToggleDirective {
  readonly class = input('');

  protected readonly hostClass = computed(() => cn(TOGGLE_BASE, this.class()));
}
