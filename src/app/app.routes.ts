import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'price',
    loadComponent: () => import('./simplified-calc/simplified-calc.component').then(m => m.SimplifiedCalcComponent),
  },
  {
    path: 'food',
    loadComponent: () => import('./food-calc/food-calc.component').then(m => m.FoodCalcComponent),
  },
  {
    path: 'shops',
    loadComponent: () => import('./shops/shops.component').then(m => m.ShopsComponent),
  },
  {
    path: 'offers',
    loadComponent: () => import('./offers/offers.component').then(m => m.OffersComponent),
  },
  {
    path: '**',
    redirectTo: 'price',
  },
];
