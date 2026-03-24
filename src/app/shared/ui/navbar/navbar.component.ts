import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav class="flex items-center gap-1 bg-base-300 px-4 py-2 shadow-lg mb-4">
      <ng-content />
    </nav>
  `,
})
export class NavbarComponent {}
