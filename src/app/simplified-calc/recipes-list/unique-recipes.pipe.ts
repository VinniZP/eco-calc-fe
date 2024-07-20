import { Pipe, PipeTransform } from '@angular/core';
import { Recipe } from '../../data/recipes';

@Pipe({
  name: 'uniqueRecipes',
  standalone: true,
})
export class UniqueRecipesPipe implements PipeTransform {
  transform(value: Recipe[]): Recipe[] {
    const uniqueSet = new Set();
    return value.filter((recipe) => {
      const skillNeed =
        recipe.skillNeeds.length > 0 ? recipe.skillNeeds[0] : { name: '', level: 0 };
      const key = `${recipe.craftingTable}-${skillNeed.name}-${skillNeed.level}`;
      if (uniqueSet.has(key)) {
        return false;
      }
      uniqueSet.add(key);
      return true;
    });
  }
}
