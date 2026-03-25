import { inject } from '@angular/core';
import { DialogRef, DialogService } from '../../shared/dialog.service';
import { ShopPickerComponent } from './shop-picker.component';

export function shopDialogManager() {
  const dialog = inject(DialogService);
  return {
    open: (product: string): DialogRef<number | null> => {
      return dialog.open<ShopPickerComponent, number | null>(ShopPickerComponent, {
        data: { product },
        id: 'shop-dialog-' + product,
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
      });
    },
  };
}
