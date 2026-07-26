import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * The path of the page currently on screen, without its fragment.
 *
 * Anything linking to a heading on the same page hangs its link off this rather than off a bare
 * `#id` href: that resolves against the document's base URL, and `<base href="/">` sends every one
 * of them to the site root instead of down the page. Naming the path keeps the link on this page —
 * and going through the router is what gets the configured anchor scrolling to run.
 */
@Injectable({ providedIn: 'root' })
export class PagePath {
  private readonly router = inject(Router);

  readonly value = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.path())
    ),
    { initialValue: this.path() }
  );

  private path(): string {
    return this.router.url.split('#')[0];
  }
}
