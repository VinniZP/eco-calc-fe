import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  page = input(1);
  pageSize = input(30);
  totalPages = input(0);
  pageChange = output<number>();
  pageSizeChange = output<number>();

  pagesToRender = computed(() => {
    // {page: number, text: string, active: boolean, disabled: boolean}
    // should be an array of objects, 2 before current, current, 2 after current and first and last and ...
    const pages = [];
    const current = this.page();
    const total = this.totalPages();
    const maxPages = 5;
    const maxPagesBefore = 2;
    const maxPagesAfter = 2;
    const first = 1;
    const last = total;

    if (total <= maxPages) {
      // Case 1: Total pages are less than or equal to max pages
      for (let i = 1; i <= total; i++) {
        pages.push({ page: i, text: i.toString(), active: i === current, disabled: false });
      }
    } else {
      // Case 2: Current page is close to the beginning
      if (current <= maxPagesBefore + 1) {
        for (let i = 1; i <= maxPages; i++) {
          pages.push({ page: i, text: i.toString(), active: i === current, disabled: false });
        }
        if (total > maxPages) {
          pages.push({ page: 0, text: '...', active: false, disabled: true });
          pages.push({ page: last, text: last.toString(), active: false, disabled: false });
        }
      }
      // Case 3: Current page is close to the end
      else if (current >= total - maxPagesAfter) {
        pages.push({ page: first, text: first.toString(), active: false, disabled: false });
        pages.push({ page: 0, text: '...', active: false, disabled: true });
        for (let i = total - maxPages + 1; i <= total; i++) {
          pages.push({ page: i, text: i.toString(), active: i === current, disabled: false });
        }
      }
      // Case 4: Current page is in the middle
      else {
        pages.push({ page: first, text: first.toString(), active: false, disabled: false });
        pages.push({ page: 0, text: '...', active: false, disabled: true });
        for (let i = current - maxPagesBefore; i <= current + maxPagesAfter; i++) {
          pages.push({ page: i, text: i.toString(), active: i === current, disabled: false });
        }
        if (current + maxPagesAfter < total) {
          pages.push({ page: 0, text: '...', active: false, disabled: true });
          pages.push({ page: last, text: last.toString(), active: false, disabled: false });
        }
      }
    }

    return pages;
  });

  changePage(page: number) {
    this.pageChange.emit(page);
  }
}
