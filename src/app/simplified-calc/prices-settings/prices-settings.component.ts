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
  margins = [0, 10, 15, 20, 25, 30, 40, 50, 75];

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
    // Sync store values into the model signal
    effect(() => {
      this.configModel.set({
        caloriesCost: this.userConfigStore.caloriesCost(),
        margin: this.userConfigStore.margin(),
      });
    });

    // Sync valid form values back to the store
    let initialized = false;
    effect(() => {
      const model = this.configModel();
      if (!initialized) {
        initialized = true;
        return;
      }
      if (this.configForm().valid()) {
        this.userConfigStore.updateConfig({
          caloriesCost: parseFloat(model.caloriesCost.toString()),
          margin: parseInt(model.margin.toString(), 10),
        });
      }
    });
  }
}
