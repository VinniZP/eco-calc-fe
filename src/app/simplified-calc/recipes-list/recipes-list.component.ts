import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRecycleRows,
  CdkRow,
  CdkRowDef,
  CdkTable,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, effect, inject, isDevMode, signal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { Recipe, RecipesStore } from '../../data/recipes';
import { PaginatorComponent } from '../../ui/paginator/paginator.component';
import { InputDirective, MultiSelectComponent, TableDirective, ToggleDirective } from '../../shared/ui';
import { productDialogManager } from '../product-dialog/dialog-manager';
import { ProductLinkComponent } from '../product-link/product-link.component';
import { ProfessionLineComponent } from './profession-line/profession-line.component';
import { createRecipesDataSource } from './recipes.data-source';
import { UniqueRecipesPipe } from './unique-recipes.pipe';

@Component({
    selector: 'app-recipes-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CdkTable,
        CdkRecycleRows,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCell,
        CdkCellDef,
        CdkHeaderRow,
        CdkRow,
        CdkHeaderRowDef,
        CdkRowDef,
        MultiSelectComponent,
        PaginatorComponent,
        ProductLinkComponent,
        ProfessionLineComponent,
        UniqueRecipesPipe,
        InputDirective,
        TableDirective,
        ToggleDirective,
    ],
    templateUrl: './recipes-list.component.html',
    styleUrl: './recipes-list.component.scss'
})
export class RecipesListComponent {
  filtersModel = signal({
    search: '' as string,
    table: [] as string[],
    profession: [] as string[],
    selling: false,
  });

  stripTagsFn = (s: string) => s.replace(/<[^>]*>/g, '');

  displayedColumns = ['displayName', 'craft', 'actions'];

  recipesStore = inject(RecipesStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
  tables: Signal<string[]> = this.recipesStore.tables;
  skills: Signal<string[]> = this.recipesStore.skills;

  dataSource = createRecipesDataSource();

  dialogManager = productDialogManager();

  private readonly debouncedFilters = toSignal(
    toObservable(this.filtersModel).pipe(debounceTime(300)),
    { initialValue: this.filtersModel() }
  );

  constructor() {
    const saved = localStorage.getItem('recipesFilters');
    if (saved) {
      this.filtersModel.set({ ...this.filtersModel(), ...JSON.parse(saved) });
    }

    effect(() => {
      const value = this.filtersModel();
      localStorage.setItem('recipesFilters', JSON.stringify(value));
    });

    effect(() => {
      this.dataSource.filter.set(this.debouncedFilters()!);
    });

    if (isDevMode()) {
      let opened = false;
      effect(() => {
        if (this.dataSource.paginatedData()[0]?.product === 'Сырой кирпич' && !opened) {
          this.dialogManager.open('Сырой кирпич');
          opened = true;
        }
      });
    }
  }

  changePage($event: number) {
    this.dataSource.pagination.set({ ...this.dataSource.pagination(), page: $event });
  }

  filterByProfession($event: string) {
    const current = this.filtersModel().profession;
    if (!current.includes($event)) {
      this.filtersModel.update(m => ({ ...m, profession: [...current, $event] }));
    }
  }

  filterByTable($event: string) {
    const current = this.filtersModel().table;
    if (!current.includes($event)) {
      this.filtersModel.update(m => ({ ...m, table: [...current, $event] }));
    }
  }
}
