import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { UserConfigStore } from '../../data/config';

@Component({
  selector: 'app-prices-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './prices-settings.component.html',
  styleUrl: './prices-settings.component.scss',
})
export class PricesSettingsComponent {
  form = new FormGroup({
    // decimal validator
    caloriesCost: new FormControl(0, [Validators.required, Validators.pattern(/^\d*\.?\d{0,2}$/)]),
    margin: new FormControl(0, [Validators.required, Validators.pattern(/^\d+$/)]),
  });
  userConfigStore = inject(UserConfigStore);
  destroyRef = inject(DestroyRef);
  margins = [0, 10, 15, 20, 25, 30, 40, 50, 75];

  constructor() {
    effect((onCleanup) => {
      const timer = setTimeout(() => {
        this.form.patchValue({
          caloriesCost: this.userConfigStore.caloriesCost(),
          margin: this.userConfigStore.margin(),
        });
      }, 300);
      onCleanup(() => clearTimeout(timer));
    });

    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.userConfigStore.updateConfig({
          caloriesCost: parseFloat(value.caloriesCost?.toString() ?? ''),
          margin: parseInt(value.margin?.toString() ?? '', 10),
        });
      });
  }
}
