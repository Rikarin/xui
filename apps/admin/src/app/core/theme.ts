import { Injectable } from '@angular/core';
import { type XThemeMode, createXThemeStore } from '@xui/core';

export type ThemeMode = XThemeMode;

/**
 * Owns the `.light` / `.dark` class on `<html>`, which is the whole of xUI's theming contract.
 *
 * The first paint is set by an inline script in `index.html` rather than here — by the time Angular
 * boots the page has already painted, and a toggle applied at bootstrap would flash. The shared
 * store reads back what that script decided and takes over from there.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly store = createXThemeStore({ storageKey: 'xui-admin-theme' });

  readonly mode = this.store.mode;

  toggle(): void {
    this.store.toggle();
  }
}
