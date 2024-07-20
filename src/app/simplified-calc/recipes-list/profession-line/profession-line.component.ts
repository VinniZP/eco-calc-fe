import { Component, input, output } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { Recipe } from '../../../data/recipes';

@Component({
  selector: 'app-profession-line',
  standalone: true,
  imports: [TippyDirective],
  templateUrl: './profession-line.component.html',
  styleUrl: './profession-line.component.scss',
})
export class ProfessionLineComponent {
  recipe = input.required<Recipe>();

  filterByProfession = output<string>();
  filterByTable = output<string>();
}
