import { computed, Injectable, signal } from '@angular/core';

export interface User {
  name: string;
  email: string;
  role: string;
  initials: string;
}

const STORAGE_KEY = 'xui-admin-session';

const DEMO_USER: User = {
  name: 'Priya Raman',
  email: 'priya@northwind.example',
  role: 'Owner',
  initials: 'PR'
};

/**
 * Who is signed in.
 *
 * There is no authentication here and there is not meant to be — the sign-in screen exists so the
 * example covers the shape of a real app (a route outside the shell, a guard, a redirect back to
 * where you were headed) rather than to keep anyone out. Any password is accepted.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        this.user.set(DEMO_USER);
      }
    } catch {
      // A blocked store just means signing in again.
    }
  }

  signIn(email: string): void {
    this.user.set({ ...DEMO_USER, email: email.trim() || DEMO_USER.email });

    try {
      localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // Not worth failing the sign-in over.
    }
  }

  signOut(): void {
    this.user.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }
}
