import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, PLATFORM_ID, type WritableSignal, effect, inject, signal } from '@angular/core';

export type XThemeMode = 'light' | 'dark';

export interface XThemeStoreOptions {
  /** The `localStorage` key the chosen mode is persisted under. */
  storageKey: string;
}

export interface XThemeStore {
  /** The current mode; writable so a settings surface can set it directly. */
  readonly mode: WritableSignal<XThemeMode>;
  /** Flips between `'light'` and `'dark'`. */
  toggle(): void;
}

/**
 * Owns the `.light` / `.dark` class on `<html>`, which is the whole of xUI's theming contract.
 *
 * The first paint is expected to be set by an inline script in `index.html` rather than here — by
 * the time Angular boots, the page has already been painted, and a toggle applied at bootstrap
 * would flash. The store reads back what that script decided and takes over from there, persisting
 * every change under `storageKey` for the script to pick up on the next visit.
 *
 * Must be called in an injection context — typically as the field initializer of an
 * app-level `Theme` service:
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class Theme {
 *   private readonly store = createXThemeStore({ storageKey: 'my-app-theme' });
 *
 *   readonly mode = this.store.mode;
 *   readonly toggle = this.store.toggle;
 * }
 * ```
 *
 * SSR-safe: on the server the mode signal stays at `'dark'` and no DOM or storage is touched.
 */
export function createXThemeStore(options: XThemeStoreOptions): XThemeStore {
  const document = inject(DOCUMENT);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  const mode = signal<XThemeMode>('dark');

  if (isBrowser) {
    mode.set(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  }

  effect(() => {
    const value = mode();

    if (!isBrowser) {
      return;
    }

    document.documentElement.classList.toggle('dark', value === 'dark');
    document.documentElement.classList.toggle('light', value === 'light');

    try {
      localStorage.setItem(options.storageKey, value);
    } catch {
      // A blocked store only costs the preference on the next visit.
    }
  });

  return {
    mode,
    toggle: () => mode.update(value => (value === 'dark' ? 'light' : 'dark'))
  };
}
