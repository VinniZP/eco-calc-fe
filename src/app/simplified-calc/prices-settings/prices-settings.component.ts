import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { form, FormField, required, pattern } from '@angular/forms/signals';
import { UserConfigStore } from '../../data/config';
import { CardComponent, FormFieldComponent, InputDirective } from '../../shared/ui';

@Component({
    selector: 'app-prices-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, CardComponent, FormFieldComponent, InputDirective],
    templateUrl: './prices-settings.component.html',
    styleUrl: './prices-settings.component.scss'
})
export class PricesSettingsComponent {
  userConfigStore = inject(UserConfigStore);

  configModel = signal({
    caloriesCost: 0,
    margin: 0,
  });

  configForm = form(this.configModel, (schemaPath) => {
    required(schemaPath.caloriesCost, { message: 'Required' });
    pattern(schemaPath.caloriesCost, /^\d*\.?\d{0,2}$/, { message: 'Invalid decimal format' });
    required(schemaPath.margin, { message: 'Required' });
    pattern(schemaPath.margin, /^\d+$/, { message: 'Must be an integer' });
  });

  constructor() {
    effect(() => {
      this.configModel.set({
        caloriesCost: this.userConfigStore.caloriesCost(),
        margin: this.userConfigStore.margin(),
      });
    });

    effect(() => {
      const model = this.configModel();
      const caloriesCost = parseFloat(model.caloriesCost.toString());
      const margin = parseInt(model.margin.toString(), 10);
      if (this.configForm().valid() &&
          (caloriesCost !== this.userConfigStore.caloriesCost() || margin !== this.userConfigStore.margin())) {
        this.userConfigStore.updateConfig({ caloriesCost, margin });
      }
    });
  }
}
