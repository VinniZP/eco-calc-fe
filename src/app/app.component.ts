import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { getState, patchState } from '@ngrx/signals';
import { combineLatest } from 'rxjs';
import { UserConfigStore } from './data/config';
import { ItemsService } from './services/items.service';
import { RecipesService } from './services/recipes.service';
import { ShopsService } from './services/shops.service';
import { UserService } from './services/user.service';
import { ButtonDirective } from './shared/ui/button/button.directive';
import { LoadingComponent } from './shared/ui/loading/loading.component';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { ToastService } from './shared/toast.service';

@Component({
    selector: 'app-root',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, ButtonDirective, LoadingComponent],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  itemsService = inject(ItemsService);
  recipesService = inject(RecipesService);
  shopsService = inject(ShopsService);
  userService = inject(UserService);
  userConfigStore = inject(UserConfigStore);
  toastService = inject(ToastService);
  loadingState = signal(true);

  constructor() {
    effect(() => {
      localStorage.setItem('conf', JSON.stringify(getState(this.userConfigStore)));
    });
  }

  ngOnInit() {
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

  reloadShopsAndUser() {
    this.loadingState.set(true);
    combineLatest([
      this.shopsService.load(),
      this.userService.load(),
    ]).subscribe(() => {
      this.loadingState.set(false);
    });
  }
}
