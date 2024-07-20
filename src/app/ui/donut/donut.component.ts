import { NgForOf } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-donut',
  standalone: true,
  imports: [NgForOf, TippyDirective],
  templateUrl: './donut.component.html',
  styleUrl: './donut.component.scss',
})
export class DonutComponent {
  items = input([
    { name: 'Углеводы', count: 10, color: 'red' },
    { name: 'Витамины', count: 10, color: 'green' },
    { name: 'Жыры', count: 10, color: 'orange' },
    { name: 'Белки', count: 10, color: 'yellow' },
  ]);
  private _total = computed(() => {
    return this.items()
      .map((a) => a.count)
      .reduce((x, y) => x + y);
  });
  constructor() {}

  getPerimeter(radius: number): number {
    return Math.PI * 2 * radius;
  }

  getColor(index: number): string {
    return this.items()[index].color;
  }

  getOffset(radius: number, index: number): number {
    let percent = 0;
    for (var i = 0; i < index; i++) {
      percent += this.items()[i].count / this._total();
    }
    const perimeter = Math.PI * 2 * radius;
    return perimeter * percent;
  }
}
