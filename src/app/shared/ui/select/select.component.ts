import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  input,
  model,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Listbox, Option } from '@angular/aria/listbox';

import { cn } from '../cn';
import { SelectOptionDirective } from './select-option.directive';

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    NgTemplateOutlet,
    Listbox,
    Option,
  ],
  styles: `
    :host { display: block; }
    [ngOption][data-active='true'] { background-color: oklch(from var(--color-base-content) l c h / 0.1); }
    [ngOption][aria-selected='true'] { background-color: oklch(from var(--color-primary) l c h / 0.2); color: var(--color-primary); }
    .select-panel { scrollbar-width: thin; scrollbar-color: oklch(from var(--color-base-content) l c h / 0.2) transparent; }
  `,
  template: `
    <div
      #trigger
      cdkOverlayOrigin
      #overlayOrigin="cdkOverlayOrigin"
      (click)="toggle()"
      [class]="triggerClass()"
      role="combobox"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="listbox"
      tabindex="0"
      (keydown)="onTriggerKeydown($event)"
    >
      @if (value() != null) {
        @if (optionTpl() && selectedItem()) {
          <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
            <ng-container *ngTemplateOutlet="optionTpl()!; context: { $implicit: selectedItem() }" />
          </div>
        } @else {
          <span class="truncate">{{ selectedLabel() }}</span>
        }
      } @else {
        <span class="truncate text-base-content/40">{{ placeholder() }}</span>
      }

      <div class="ml-auto flex items-center gap-1 shrink-0">
        @if (clearable() && value() != null) {
          <button
            type="button"
            (click)="clear($event)"
            class="text-base-content/40 hover:text-base-content transition-colors"
            aria-label="Clear"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
        <svg class="h-4 w-4 text-base-content/40 transition-transform" [class.rotate-180]="isOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="overlayOrigin"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      (overlayOutsideClick)="close()"
    >
      <div class="bg-base-200 border border-base-content/15 rounded shadow-lg mt-1 overflow-hidden">
        @if (searchable()) {
          <input
            #searchInput
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            (keydown)="onPanelKeydown($event)"
            placeholder="Поиск..."
            class="w-full bg-base-300 border-b border-base-content/15 px-3 py-2 text-sm text-base-content focus:outline-none"
          />
        }

        <div ngListbox selectionMode="explicit" class="select-panel max-h-60 overflow-y-auto overflow-x-hidden" (keydown)="onPanelKeydown($event)">
          @for (item of filteredOptions(); track trackItem(item)) {
            <div
              ngOption
              [value]="item"
              (click)="select(item)"
              class="px-3 py-2 text-sm cursor-pointer break-all"
            >
              @if (optionTpl()) {
                <ng-container *ngTemplateOutlet="optionTpl()!; context: { $implicit: item }" />
              } @else {
                {{ getLabel(item) }}
              }
            </div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class  SelectComponent<T = any> {
  readonly value = model<T | null>(null);
  readonly options = input<T[]>([]);
  readonly labelFn = input<((item: T) => string) | undefined>(undefined);
  readonly trackFn = input<((item: T) => unknown) | undefined>(undefined);
  readonly placeholder = input('');
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md'>('md');

  protected readonly optionTpl = contentChild(SelectOptionDirective, { read: TemplateRef });
  private readonly triggerEl = viewChild<ElementRef<HTMLElement>>('trigger');

  readonly isOpen = signal(false);
  readonly searchQuery = signal('');

  protected readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const opts = this.options();
    if (!query) return opts;
    return opts.filter(item => this.getLabel(item).toLowerCase().includes(query));
  });

  protected readonly selectedItem = computed(() => {
    const val = this.value();
    if (val == null) return null;
    return this.options().find(item => this.trackItem(item) === this.trackItem(val as T)) ?? null;
  });

  protected readonly selectedLabel = computed(() => {
    const item = this.selectedItem();
    return item != null ? this.getLabel(item) : '';
  });

  protected readonly triggerWidth = computed(() =>
    this.triggerEl()?.nativeElement.offsetWidth ?? 0,
  );

  protected readonly triggerClass = computed(() => {
    const sizeClass = this.size() === 'sm' ? 'min-h-8 px-3 py-1' : 'min-h-10 px-4 py-1.5';
    return cn(
      'flex items-center gap-2 w-full bg-base-200/80 border border-base-content/15 rounded text-base-content text-sm cursor-pointer transition-all duration-200',
      'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40',
      sizeClass,
    );
  });

  getLabel(item: T): string {
    const fn = this.labelFn();
    return fn ? fn(item) : String(item);
  }

  trackItem(item: T): unknown {
    const fn = this.trackFn();
    return fn ? fn(item) : item;
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.isOpen.set(true);
    this.searchQuery.set('');
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  select(item: T): void {
    this.value.set(item);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}
