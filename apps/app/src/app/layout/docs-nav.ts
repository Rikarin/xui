import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { XuiInputImports } from '@xui/input';
import { XuiTextImports } from '@xui/text';
import { COMPONENTS, GROUPS } from '../../generated/manifest';
import { LayoutState } from '../core/layout-state';

const GUIDES = [
  { label: 'Getting started', path: '/docs/getting-started' },
  { label: 'Theming', path: '/docs/theming' },
  { label: 'AI agents', path: '/docs/ai-agents' },
  { label: 'All components', path: '/docs/components' }
];

/** The sidebar's contents, shared by the desktop rail and the mobile drawer. */
@Component({
  selector: 'docs-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, XuiInputImports, XuiTextImports],
  host: { class: 'block' },
  template: `
    <label class="sr-only" for="docs-nav-filter">Filter components</label>
    <input
      xuiInput
      id="docs-nav-filter"
      type="search"
      class="mb-4 w-full"
      placeholder="Filter components…"
      [value]="query()"
      (input)="query.set($any($event.target).value)"
    />

    <nav aria-label="Documentation">
      @if (!query()) {
        <ul class="mb-6 space-y-0.5">
          @for (guide of guides; track guide.path) {
            <li>
              <a
                class="text-foreground-muted hover:bg-surface-inset hover:text-foreground block rounded-md px-2 py-1.5 text-sm transition-colors"
                routerLinkActive="bg-surface-inset text-foreground font-medium"
                [routerLink]="guide.path"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="layout.closeMobileNav()"
                >{{ guide.label }}</a
              >
            </li>
          }
        </ul>
      }

      @for (group of visibleGroups(); track group.name) {
        <p xuiText size="xs" weight="semibold" color="subtle" class="mt-5 mb-1.5 px-2 tracking-wide uppercase">
          {{ group.name }}
        </p>
        <ul class="space-y-0.5">
          @for (component of group.items; track component.slug) {
            <li>
              <a
                class="text-foreground-muted hover:bg-surface-inset hover:text-foreground block rounded-md px-2 py-1.5 text-sm transition-colors"
                routerLinkActive="bg-surface-inset text-foreground font-medium"
                [routerLink]="['/docs/components', component.slug]"
                (click)="layout.closeMobileNav()"
                >{{ component.title }}</a
              >
            </li>
          }
        </ul>
      }

      @if (visibleGroups().length === 0) {
        <p xuiText color="muted" size="sm" class="px-2 py-4">No component matches “{{ query() }}”.</p>
      }
    </nav>
  `
})
export class DocsNav {
  protected readonly layout = inject(LayoutState);
  protected readonly guides = GUIDES;
  protected readonly query = signal('');

  protected readonly visibleGroups = computed(() => {
    const query = this.query().trim().toLowerCase();
    const matches = query
      ? COMPONENTS.filter(
          component => component.title.toLowerCase().includes(query) || component.package.toLowerCase().includes(query)
        )
      : COMPONENTS;

    return GROUPS.map(name => ({ name, items: matches.filter(component => component.group === name) })).filter(
      group => group.items.length > 0
    );
  });
}
