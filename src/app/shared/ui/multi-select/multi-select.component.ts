import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { Listbox, Option } from '@angular/aria/listbox';

import { cn } from '../cn';

@Component({
  selector: 'app-multi-select',
  imports: [SlicePipe, Listbox, Option],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  styles: `
    :host { display: block; position: relative; }
    [ngOption][data-active='true'] { background-color: oklch(from var(--color-base-content) l c h / 0.1); }
    [ngOption][aria-selected='true'] { background-color: oklch(from var(--color-primary) l c h / 0.15); }
    .select-panel { scrollbar-width: thin; scrollbar-color: oklch(from var(--color-base-content) l c h / 0.2) transparent; }
  `,
  template: `
    <div
      #trigger
      (click)="toggle()"
      [class]="triggerClass()"
      role="combobox"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="listbox"
      tabindex="0"
      (keydown)="onTriggerKeydown($event)"
    >
      @if (value().length === 0) {
        <span class="text-base-content/40 text-sm select-none">{{ placeholder() }}</span>
      } @else {
        @for (item of value() | slice:0:maxLabels(); track trackItem(item)) {
          <span class="bg-base-100 border border-base-content/15 rounded px-2 py-0.5 text-xs flex items-center gap-1">
            {{ getLabel(item) }}
            <button
              type="button"
              class="text-base-content/40 hover:text-base-content leading-none cursor-pointer"
              (click)="removeItem(item, $event)"
              aria-label="Remove"
            >&times;</button>
          </span>
        }
        @if (value().length > maxLabels()) {
          <span class="text-xs text-base-content/50">+{{ value().length - maxLabels() }}</span>
        }
      }
      <svg class="w-4 h-4 ml-auto shrink-0 text-base-content/40 transition-transform" [class.rotate-180]="isOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    @if (isOpen()) {
      <div ngListbox multi selectionMode="explicit" class="select-panel absolute left-0 right-0 z-50 bg-base-200 border border-base-content/15 rounded shadow-lg mt-1 max-h-60 overflow-y-auto overflow-x-hidden">
        @for (item of options(); track trackItem(item)) {
          <div
            ngOption
            [value]="item"
            (click)="toggleItem(item)"
            class="px-3 py-2 text-sm cursor-pointer flex items-center gap-2 wrap-break-word min-w-0"
          >
            <div [class]="checkboxClass(item)">
              @if (isSelected(item)) {
                <svg class="w-3 h-3 text-primary-content" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              }
            </div>
            <span>{{ getLabel(item) }}</span>
          </div>
        }
      </div>
    }
  `,
})
export class MultiSelectComponent {
  private readonly hostEl = inject(ElementRef);

  readonly value = model<any[]>([]);
  readonly options = input<any[]>([]);
  readonly labelFn = input<((item: any) => string) | undefined>(undefined);
  readonly trackFn = input<((item: any) => unknown) | undefined>(undefined);
  readonly placeholder = input('');
  readonly maxLabels = input(2);
  readonly size = input<'sm' | 'md'>('sm');

  readonly isOpen = signal(false);

  private readonly selectedKeys = computed(() => {
    const track = this.trackFn();
    return new Set(this.value().map(v => track ? track(v) : v));
  });

  readonly triggerClass = computed(() =>
    cn(
      'min-h-8 bg-base-200/80 border border-base-content/15 rounded text-sm px-2 py-1 flex flex-wrap items-center gap-1 cursor-pointer outline-none',
      'focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
      this.size() === 'md' && 'min-h-10 px-3 py-1.5',
    ),
  );

  getLabel(item: any): string {
    const fn = this.labelFn();
    return fn ? fn(item) : String(item);
  }

  trackItem(item: any): unknown {
    const fn = this.trackFn();
    return fn ? fn(item) : item;
  }

  isSelected(item: any): boolean {
    const track = this.trackFn();
    return this.selectedKeys().has(track ? track(item) : item);
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggleItem(item: any): void {
    if (this.isSelected(item)) {
      this.removeFromValue(item);
    } else {
      this.value.update(v => [...v, item]);
    }
  }

  removeItem(item: any, event: Event): void {
    event.stopPropagation();
    this.removeFromValue(item);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen.set(true);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  checkboxClass(item: any): string {
    return cn(
      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
      this.isSelected(item) ? 'bg-primary border-primary' : 'border-base-content/30',
    );
  }

  onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.hostEl.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private removeFromValue(item: any): void {
    const track = this.trackFn();
    const key = track ? track(item) : item;
    this.value.update(v => v.filter(i => (track ? track(i) : i) !== key));
  }
}
