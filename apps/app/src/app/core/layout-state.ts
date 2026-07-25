import { Injectable, signal } from '@angular/core';

/** Shared between the header's menu button and the docs sidebar drawer. */
@Injectable({ providedIn: 'root' })
export class LayoutState {
  readonly mobileNavOpen = signal(false);

  openMobileNav(): void {
    this.mobileNavOpen.set(true);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
