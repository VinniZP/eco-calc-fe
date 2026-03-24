import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav class="flex items-center gap-1 bg-gradient-to-r from-base-300 via-base-300/95 to-base-300 px-4 py-2 border-b border-primary/10 shadow-md shadow-black/15 backdrop-blur-sm">
      <ng-content />
    </nav>
  `,
})
export class NavbarComponent {}
