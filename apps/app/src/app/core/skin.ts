import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';

/** The styles the docs can be rendered in: the library's own, or the optional bezelled skin. */
export type SkinName = 'default' | 'bezel';

export const SKINS: readonly { value: SkinName; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'bezel', label: 'Bezelled' }
];

const STORAGE_KEY = 'xui-docs-skin';

/**
 * Owns the `data-skin` attribute on `<html>`, which is how `@xui/core/styles/bezel.css` is opted
 * into — the same one line a consuming application writes in its own `index.html`.
 *
 * Deliberately shaped like {@link Theme}: the first paint is decided by an inline script in
 * `index.html`, because a skin applied at bootstrap would flash the other one while the bundle
 * loads. This reads back what that script decided and takes over, persisting every change for the
 * script to pick up next time.
 *
 * SSR-safe — on the server the signal stays at `'default'` and nothing touches the DOM or storage.
 */
@Injectable({ providedIn: 'root' })
export class Skin {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly name = signal<SkinName>('default');

  constructor() {
    if (this.isBrowser) {
      this.name.set(this.document.documentElement.getAttribute('data-skin') === 'bezel' ? 'bezel' : 'default');
    }

    effect(() => {
      const value = this.name();

      if (!this.isBrowser) {
        return;
      }

      const root = this.document.documentElement;
      if (value === 'default') {
        root.removeAttribute('data-skin');
      } else {
        root.setAttribute('data-skin', value);
      }

      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // A blocked store only costs the preference on the next visit.
      }
    });
  }
}
