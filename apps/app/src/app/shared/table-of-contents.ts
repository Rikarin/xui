import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiTextImports } from '@xui/text';
import { PagePath } from './page-path';

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
  /** The page's own path, which the links are hung off explicitly. See {@link PagePath}. */
  protected readonly path = inject(PagePath).value;

  readonly entries = input.required<TocEntry[]>();
}
