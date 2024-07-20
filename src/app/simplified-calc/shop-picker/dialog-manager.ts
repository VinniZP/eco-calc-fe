import { Dialog } from '@angular/cdk/dialog';
import { inject } from '@angular/core';
import { ShopPickerComponent } from './shop-picker.component';

export function shopDialogManager() {
  const dialog = inject(Dialog);
  return {
    open: (product: string) => {
      let dialogById = dialog.getDialogById('shop-dialog-' + product);
      if (dialogById) {
        return dialogById;
      }
      return dialog.open(ShopPickerComponent, ShopPickerComponent.config({ product }));
    },
  };
}
