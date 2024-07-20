import { Routes } from '@angular/router';
import { FoodCalcComponent } from './food-calc/food-calc.component';
import { SimplifiedCalcComponent } from './simplified-calc/simplified-calc.component';

export const routes: Routes = [
  {
    path: 'price',
    component: SimplifiedCalcComponent,
  },
  {
    path: 'food',
    component: FoodCalcComponent,
  },
  {
    path: '**',
    redirectTo: 'price',
  },
];
