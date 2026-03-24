import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<Toast | null>(null);
  private timeout: ReturnType<typeof setTimeout> | null = null;

  show(message: string, duration = 2000): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.toast.set({ message, duration });
    this.timeout = setTimeout(() => this.toast.set(null), duration);
  }
}
