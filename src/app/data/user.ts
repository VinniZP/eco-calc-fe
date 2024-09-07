import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface Testiness {
  name: string;
  testiness: 'Ok' | 'Favorite' | 'Good' | 'Delicious' | 'Bad' | 'Horrible' | 'Wroth';
}

export interface Content {
  name: string;
}

export interface StomachData {
  content: Content[];
  testiness: Testiness[];
}

export interface User {
  name: string;
  skills: { name: string; level: number }[];
  stomach: StomachData;
}

export const UserStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withState<User>({ name: '', skills: [], stomach: { content: [], testiness: [] } }),
  withMethods((store) => ({
    setUser(user: User) {
      patchState(store, user);
    },
  })),
);
