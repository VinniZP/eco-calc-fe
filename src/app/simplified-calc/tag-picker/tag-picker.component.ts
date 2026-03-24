import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { ItemsStore } from '../../data/items';
import { SelectComponent } from '../../shared/ui';

@Component({
  selector: 'app-tag-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, TippyDirective],
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

  selectOptions = computed(() => [null, ...this.possibleItems()]);
  labelFn = (item: string | null) => item ?? 'Тег: ' + this.tag();
}
