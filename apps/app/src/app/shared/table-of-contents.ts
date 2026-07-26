import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { XuiTextImports } from '@xui/text';
import { filter, map } from 'rxjs';

export interface TocEntry {
  id: string;
  label: string;
  level: 2 | 3;
}

/**
 * The in-page outline, shown from `xl` up.
 *
 * Links rather than scroll-spy: the router is already configured with anchor scrolling, so a click
 * lands on the heading and the URL stays shareable.
 */
@Component({
  selector: 'docs-table-of-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiTextImports],
  host: { class: 'w-56 shrink-0' },
  template: `
    <nav class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto" aria-label="On this page">
      <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">On this page</p>
      <ul class="space-y-1 border-s ps-3">
        @for (entry of entries(); track entry.id) {
          <li [class]="entry.level === 3 ? 'ps-3' : ''">
            <a
              class="text-foreground-muted hover:text-foreground block truncate text-sm transition-colors"
              [routerLink]="path()"
              [fragment]="entry.id"
              >{{ entry.label }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `
})
export class TableOfContents {
  private readonly router = inject(Router);

  /**
   * The page's own path, which the links are hung off explicitly.
   *
   * A bare `#id` href resolves against the document's base URL, and `<base href="/">` sent every one
   * of these to the site root instead of down the page. Naming the path keeps the link on this page
   * — and going through the router is what gets the configured anchor scrolling to run.
   */
  protected readonly path = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.currentPath())
    ),
    { initialValue: this.currentPath() }
  );

  readonly entries = input.required<TocEntry[]>();

  private currentPath(): string {
    return this.router.url.split('#')[0];
  }
}
