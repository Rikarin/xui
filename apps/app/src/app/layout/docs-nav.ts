import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { XuiInputImports } from '@xui/input';
import { XuiTextImports } from '@xui/text';
import { filter } from 'rxjs';
import { COMPONENTS, GROUPS } from '../../generated/manifest';
import { LayoutState } from '../core/layout-state';

const GUIDES = [
  { label: 'Getting started', path: '/docs/getting-started' },
  { label: 'Theming', path: '/docs/theming' },
  { label: 'Theme builder', path: '/docs/theme-builder' },
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
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly layout = inject(LayoutState);
  protected readonly guides = GUIDES;
  protected readonly query = signal('');

  constructor() {
    afterNextRender(() => {
      this.revealActive();

      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.revealActive());
    });
  }

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

  /**
   * Brings the entry for the page you are on into view.
   *
   * The list is a hundred components in a scroller of its own, so opening one halfway down it —
   * from a link, a search result, a reload — otherwise leaves the rail sitting at the top with no
   * sign of where you are.
   *
   * The entry is found by its href rather than by the active class: `RouterLinkActive` sets that
   * during the change detection this navigation schedules, so it is not on the element yet.
   */
  private revealActive(retry = true): void {
    const path = this.router.url.split(/[?#]/)[0];
    const host = this.host.nativeElement as HTMLElement;
    const links = [...host.querySelectorAll<HTMLAnchorElement>('a[href]')];
    const link = links.find(anchor => anchor.getAttribute('href') === path);
    const scroller = link && scrollParent(link);

    if (!link || !scroller) {
      return;
    }

    // Nothing has been laid out yet — a tab that is still hidden, say. Every rect would read zero,
    // which the check below would take for "already in view", so come back one frame later. Once.
    if (scroller.clientHeight === 0) {
      if (retry) {
        requestAnimationFrame(() => this.revealActive(false));
      }

      return;
    }

    const entry = link.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();

    // Already on screen: leave the list where it is rather than yanking it on every navigation.
    if (entry.top >= view.top && entry.bottom <= view.bottom) {
      return;
    }

    scroller.scrollTop += entry.top - view.top - (scroller.clientHeight - entry.height) / 2;
  }
}

/** The nearest ancestor that scrolls: the rail on desktop, the drawer body under `lg`. */
function scrollParent(element: HTMLElement): HTMLElement | undefined {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;

    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }

  return undefined;
}
