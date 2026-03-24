import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="flex items-center justify-between gap-2">
      <label class="text-sm">{{ label() }}</label>
      <ng-content />
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
}
