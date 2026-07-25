import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'xui-docs-theme';

/**
 * Owns the `.light` / `.dark` class on `<html>`, which is the whole of xUI's theming contract.
 *
 * The first paint is set by an inline script in `index.html` rather than here — by the time Angular
 * boots, the page has already been painted, and a toggle applied at bootstrap would flash. This
 * service reads back what that script decided and takes over from there.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mode = signal<ThemeMode>('dark');

  constructor() {
    if (this.isBrowser) {
      this.mode.set(this.document.documentElement.classList.contains('light') ? 'light' : 'dark');
    }

    effect(() => {
      const mode = this.mode();

      if (!this.isBrowser) {
        return;
      }

      this.document.documentElement.classList.toggle('dark', mode === 'dark');
      this.document.documentElement.classList.toggle('light', mode === 'light');
      localStorage.setItem(STORAGE_KEY, mode);
    });
  }

  toggle(): void {
    this.mode.update(mode => (mode === 'dark' ? 'light' : 'dark'));
  }
}
