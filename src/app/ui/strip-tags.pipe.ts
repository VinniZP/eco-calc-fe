import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripTags',
  standalone: true,
})
export class StripTagsPipe implements PipeTransform {
  transform(value: any): unknown {
    // strip all html tags
    return value.replace(/<[^>]*>/g, '');
  }
}
