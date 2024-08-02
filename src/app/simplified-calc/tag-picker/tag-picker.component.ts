import { NgForOf } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { ItemsStore } from '../../data/items';

@Component({
  selector: 'app-tag-picker',
  standalone: true,
  imports: [NgSelectModule, FormsModule, NgForOf, TippyDirective],
  templateUrl: './tag-picker.component.html',
  styleUrl: './tag-picker.component.scss',
})
export class TagPickerComponent {
  tag = input.required<string>();
  static = input<boolean>(false);
  product = model<string | null>(null);
  itemsStore = inject(ItemsStore);

  possibleItems = computed(() => {
    return this.itemsStore.tagsToItemNameMap()[this.tag()] || [];
  });
}
