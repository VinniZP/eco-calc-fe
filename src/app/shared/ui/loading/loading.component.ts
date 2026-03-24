import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fixed inset-0 z-50 flex items-center justify-center bg-base-300/80 backdrop-blur-sm' },
  template: `
    <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  `,
})
export class LoadingComponent {}
