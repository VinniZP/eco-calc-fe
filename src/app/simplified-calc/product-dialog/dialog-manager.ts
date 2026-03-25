import { inject } from '@angular/core';
import { DialogService } from '../../shared/dialog.service';
import { ProductDialogComponent } from './product-dialog.component';

export function productDialogManager() {
  const dialog = inject(DialogService);
  return {
    open: (product: string) => {
      return dialog.open(ProductDialogComponent, {
        data: { product },
        id: 'product-dialog-' + product,
        width: '100%',
        maxWidth: 'calc(100vw - 32px)',
      });
    },
  };
}
