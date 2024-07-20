import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of, tap } from 'rxjs';
import { UserStore } from '../data/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  userStore = inject(UserStore);
  lastUpdate: Date | null = null;

  matSnackbarService = inject(MatSnackBar);

  load() {
    const seconds = 15;
    if (
      this.lastUpdate !== null &&
      new Date().getTime() - this.lastUpdate.getTime() < 1000 * seconds
    ) {
      return of(null);
    }
    this.lastUpdate = new Date();
    return this.http.get<any>('/api/v1/plugins/EcoCalculator/me').pipe(
      tap((r) => {
        this.userStore.setUser({
          name: r.Name,
          stomach: {
            content: r.Stomach.Content.map((c: any) => ({ name: c.Name })),
            testiness: r.Stomach.Testiness.map((t: any) => ({
              name: t.Name,
              testiness: t.Testiness,
            })),
          },
          skills: r.Skills.map((s: any) => ({ name: s.Name, level: s.Level })),
        });
      }),
      catchError(() => of(null)),
    );
  }
}
