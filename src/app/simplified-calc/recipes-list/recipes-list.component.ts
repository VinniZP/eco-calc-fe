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
import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, isDevMode, OnInit, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, startWith } from 'rxjs';
import { syncFormToLocalStorage } from '../../core/helpers/form';
import { Recipe, RecipesStore } from '../../data/recipes';
import { PaginatorComponent } from '../../ui/paginator/paginator.component';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';
import { productDialogManager } from '../product-dialog/dialog-manager';
import { ProductLinkComponent } from '../product-link/product-link.component';
import { ProfessionLineComponent } from './profession-line/profession-line.component';
import { createRecipesDataSource } from './recipes.data-source';
import { UniqueRecipesPipe } from './unique-recipes.pipe';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
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
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    SlicePipe,
    PaginatorComponent,
    ProductLinkComponent,
    ProfessionLineComponent,
    UniqueRecipesPipe,
    StripTagsPipe,
  ],
  templateUrl: './recipes-list.component.html',
  styleUrl: './recipes-list.component.scss',
})
export class RecipesListComponent implements OnInit {
  filters = new FormGroup({
    search: new FormControl<string | null>(''),
    table: new FormControl<string[] | null>([]),
    profession: new FormControl<string[] | null>([]),
    selling: new FormControl(false),
  });

  displayedColumns = ['displayName', 'craft', 'actions'];

  recipesStore = inject(RecipesStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
  tables: Signal<string[]> = this.recipesStore.tables;
  skills: Signal<string[]> = this.recipesStore.skills;

  dataSource = createRecipesDataSource();

  destroyRef = inject(DestroyRef);
  dialogManager = productDialogManager();

  constructor() {
    syncFormToLocalStorage(this.filters, 'recipesFilters');
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

  ngOnInit() {
    this.filters.valueChanges
      .pipe(startWith(this.filters.value), debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        this.dataSource.filter.set(value);
      });
  }

  changePage($event: number) {
    this.dataSource.pagination.set({ ...this.dataSource.pagination(), page: $event });
  }

  filterByProfession($event: string) {
    const currentValues = this.filters.controls.profession.value || [];
    if (!currentValues.includes($event)) {
      this.filters.controls.profession.setValue([...currentValues, $event]);
    }
  }

  filterByTable($event: string) {
    const currentValues = this.filters.controls.table.value || [];
    if (!currentValues.includes($event)) {
      this.filters.controls.table.setValue([...currentValues, $event]);
    }
  }
}
