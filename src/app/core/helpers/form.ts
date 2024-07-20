import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';

export function syncFormToLocalStorage(form: FormGroup, key: string) {
  const destroyRef = inject(DestroyRef);
  form.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    form.patchValue(JSON.parse(savedValue));
  }
}
