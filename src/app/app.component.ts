import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { getState, patchState } from '@ngrx/signals';
import { combineLatest } from 'rxjs';
import { UserConfigStore } from './data/config';
import { ItemsService } from './services/items.service';
import { RecipesService } from './services/recipes.service';
import { ShopsService } from './services/shops.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  itemsService = inject(ItemsService);
  recipesService = inject(RecipesService);
  shopsService = inject(ShopsService);
  userService = inject(UserService);
  userConfigStore = inject(UserConfigStore);
  loadingState = signal(true);

  constructor() {
    effect(() => {
      localStorage.setItem('conf', JSON.stringify(getState(this.userConfigStore)));
    });
  }

  ngOnInit() {
    console.log('just for test 2');
    const data = JSON.parse(localStorage.getItem('conf') || '{}');
    patchState(this.userConfigStore, data);
    combineLatest([
      this.itemsService.load(),
      this.recipesService.load(),
      this.shopsService.load(),
      this.userService.load(),
    ]).subscribe(() => {
      this.loadingState.set(false);
    });
  }
}
