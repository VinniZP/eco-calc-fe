import { Routes } from '@angular/router';
import { FoodCalcComponent } from './food-calc/food-calc.component';
import { OffersComponent } from './offers/offers.component';
import { ShopsComponent } from './shops/shops.component';
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
    path: 'shops',
    component: ShopsComponent,
  },
  {
    path: 'offers',
    component: OffersComponent,
  },
  {
    path: '**',
    redirectTo: 'price',
  },
];
