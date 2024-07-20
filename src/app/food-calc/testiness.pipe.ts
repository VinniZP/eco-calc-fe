import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'testiness',
  standalone: true,
})
export class TestinessPipe implements PipeTransform {
  transform(value: string | number): unknown {
    return (
      {
        Ok: 'Ok',
        Favorite: 'Лучшее',
        Good: 'Хорошо',
        Delicious: 'Отлично',
        Bad: 'Плохо',
        Horrible: 'Ужасно',
        Wroth: 'Худшее',
        1: 'Ok',
        1.3: 'Лучшее',
        1.1: 'Хорошо',
        1.2: 'Отлично',
        0.9: 'Плохо',
        0.8: 'Ужасно',
        0.7: 'Худшее',
      }[value] || 'Не изучено'
    );
  }
}
