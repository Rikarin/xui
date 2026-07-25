import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/** Wraps the async clipboard API so callers do not have to guard for SSR or a denied permission. */
@Injectable({ providedIn: 'root' })
export class Clipboard {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async write(text: string): Promise<boolean> {
    if (!this.isBrowser || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch {
      // Denied permission, or an insecure origin. Nothing useful to say to the user.
      return false;
    }
  }
}
