import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDarkModeRound, matLightModeRound, matMenuRound } from '@ng-icons/material-icons/round';
import { XuiButtonImports } from '@xui/button';
import { XuiIconImports } from '@xui/icon';
import { XuiTagImports } from '@xui/tag';
import { VERSION } from '../../generated/manifest';
import { LayoutState } from '../core/layout-state';
import { Theme } from '../core/theme';

const NAV = [
  { label: 'Getting started', path: '/docs/getting-started' },
  { label: 'Theming', path: '/docs/theming' },
  { label: 'Components', path: '/docs/components' },
  { label: 'AI agents', path: '/docs/ai-agents' }
];

/**
 * `docs` is the working header the documentation pages share. `landing` is the same header on the
 * black stage of the home page: no theme toggle, because that page is pinned dark, and a filled
 * call to action in the slot where the docs keep their GitHub link.
 */
export type SiteHeaderVariant = 'docs' | 'landing';

@Component({
  selector: 'docs-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgIcon, XuiIconImports, XuiButtonImports, XuiTagImports],
  providers: [provideIcons({ matMenuRound, matDarkModeRound, matLightModeRound })],
  host: { '[class]': 'hostClass()' },
  template: `
    <div class="relative mx-auto flex h-14 max-w-[100rem] items-center gap-2 px-4 sm:px-6">
      @if (showMenuButton()) {
        <button
          xuiButton
          variant="ghost"
          size="sm"
          type="button"
          class="lg:hidden"
          aria-label="Open navigation"
          (click)="layout.openMobileNav()"
        >
          <ng-icon xui name="matMenuRound" />
        </button>
      }

      <a routerLink="/" class="flex items-center font-semibold tracking-tight">
        <span class="text-primary text-lg">x</span><span class="text-lg">UI</span>
      </a>

      @if (landing()) {
        <nav
          class="absolute start-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 md:flex rtl:translate-x-1/2"
          aria-label="Main"
        >
          @for (item of nav; track item.path) {
            <a
              xuiButton
              variant="ghost"
              size="sm"
              color="secondary"
              class="text-foreground-muted hover:text-foreground rounded-full"
              [routerLink]="item.path"
              routerLinkActive="text-foreground bg-white/10"
              >{{ item.label }}</a
            >
          }
        </nav>

        <div class="ms-auto flex items-center gap-1">
          <a
            xuiButton
            variant="ghost"
            size="sm"
            color="secondary"
            class="text-foreground-muted hover:text-foreground"
            href="https://github.com/Rikarin/xui"
            rel="noreferrer noopener"
            target="_blank"
            >GitHub</a
          >
          <a routerLink="/docs/getting-started" class="landing-buy">Get started</a>
        </div>
      } @else {
        <xui-tag minimal class="hidden sm:inline-flex">{{ version }}</xui-tag>

        <nav class="ms-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          @for (item of nav; track item.path) {
            <a
              xuiButton
              variant="ghost"
              size="sm"
              [routerLink]="item.path"
              routerLinkActive="text-foreground bg-surface-inset"
              >{{ item.label }}</a
            >
          }
        </nav>

        <div class="ms-auto flex items-center gap-1">
          <button
            xuiButton
            variant="ghost"
            size="sm"
            type="button"
            [attr.aria-label]="theme.mode() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            (click)="theme.toggle()"
          >
            <ng-icon xui [name]="theme.mode() === 'dark' ? 'matLightModeRound' : 'matDarkModeRound'" />
          </button>

          <a
            xuiButton
            variant="outline"
            size="sm"
            color="secondary"
            href="https://github.com/Rikarin/xui"
            rel="noreferrer noopener"
            target="_blank"
            >GitHub</a
          >
        </div>
      }
    </div>

    @if (landing()) {
      <!-- Below the tablet breakpoint the pill nav has no room, so the same links run as a row of
           their own, scrollable, under the bar. -->
      <nav
        class="flex [scrollbar-width:none] gap-1 overflow-x-auto px-3 pb-2 md:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Main"
      >
        @for (item of nav; track item.path) {
          <a
            xuiButton
            variant="ghost"
            size="sm"
            color="secondary"
            class="text-foreground-muted hover:text-foreground shrink-0 rounded-full"
            [routerLink]="item.path"
            routerLinkActive="text-foreground bg-white/10"
            >{{ item.label }}</a
          >
        }
      </nav>
    }
  `
})
export class SiteHeader {
  protected readonly layout = inject(LayoutState);
  protected readonly theme = inject(Theme);
  protected readonly nav = NAV;
  protected readonly version = VERSION;

  /** Only the docs pages have a sidebar to open. */
  readonly showMenuButton = input(false);

  readonly variant = input<SiteHeaderVariant>('docs');

  protected readonly landing = computed(() => this.variant() === 'landing');

  protected readonly hostClass = computed(() =>
    this.landing()
      ? 'sticky top-0 z-30 block border-b border-white/[0.06] bg-black/60 backdrop-blur-md'
      : 'border-border bg-background/85 sticky top-0 z-30 block border-b backdrop-blur supports-[backdrop-filter]:bg-background/70'
  );
}
