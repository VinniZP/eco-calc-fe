import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Type,
} from '@angular/core';

export interface DialogRef<R = void> {
  close(result?: R): void;
  readonly closed: Promise<R | undefined>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open<C, R = void>(
    component: Type<C>,
    config: { data?: unknown; id?: string; width?: string; maxWidth?: string },
  ): DialogRef<R> {
    if (config.id) {
      const existing = document.getElementById(config.id) as HTMLDialogElement | null;
      if (existing?.open) {
        return this.wrapExisting<R>(existing);
      }
    }

    const dialog = document.createElement('dialog');
    dialog.classList.add('app-dialog');
    if (config.id) dialog.id = config.id;
    if (config.width) dialog.style.width = config.width;
    if (config.maxWidth) dialog.style.maxWidth = config.maxWidth;
    document.body.appendChild(dialog);

    let resolveClose!: (value: R | undefined) => void;
    const closed = new Promise<R | undefined>(r => (resolveClose = r));

    const ref: DialogRef<R> = {
      close(result?: R) {
        dialog.close();
        resolveClose(result);
        componentRef.destroy();
        dialog.remove();
      },
      closed,
    };

    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
      hostElement: dialog,
    });

    if (config.data) {
      try { componentRef.setInput('dialogData', config.data); } catch { /* input not present */ }
    }
    try { componentRef.setInput('dialogRef', config.data ? ref : ref); } catch { /* input not present */ }

    this.appRef.attachView(componentRef.hostView);
    dialog.showModal();

    return ref;
  }

  private wrapExisting<R>(dialog: HTMLDialogElement): DialogRef<R> {
    let resolveClose!: (value: R | undefined) => void;
    const closed = new Promise<R | undefined>(r => {
      resolveClose = r;
      dialog.addEventListener('close', () => r(undefined), { once: true });
    });
    return { close: (result?: R) => resolveClose(result), closed };
  }
}
