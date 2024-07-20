import { Dialog } from '@angular/cdk/dialog';
import { inject } from '@angular/core';
import { ProductDialogComponent } from './product-dialog.component';

export function productDialogManager() {
  const dialog = inject(Dialog);
  return {
    open: (product: string) => {
      let dialogById = dialog.getDialogById('product-dialog-' + product);
      if (dialogById) {
        return dialogById;
      }
      return dialog.open(ProductDialogComponent, ProductDialogComponent.config({ product }));
    },
  };
}
