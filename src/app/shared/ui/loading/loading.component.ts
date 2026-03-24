import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fixed inset-0 z-50 flex items-center justify-center bg-base-300/85 backdrop-blur-md' },
  template: `
    <div class="relative">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
      <div class="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-primary/20"></div>
    </div>
  `,
})
export class LoadingComponent {}
