import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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

@Component({
  selector: 'docs-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgIcon, XuiIconImports, XuiButtonImports, XuiTagImports],
  providers: [provideIcons({ matMenuRound, matDarkModeRound, matLightModeRound })],
  host: {
    class:
      'border-border bg-background/85 sticky top-0 z-30 block border-b backdrop-blur supports-[backdrop-filter]:bg-background/70'
  },
  template: `
    <div class="mx-auto flex h-14 max-w-[100rem] items-center gap-2 px-4 sm:px-6">
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

      <a routerLink="/" class="flex items-center gap-2 font-semibold tracking-tight">
        <span class="text-primary text-lg">x</span><span class="text-lg">UI</span>
      </a>

      <xui-tag minimal class="hidden sm:inline-flex">{{ version }}</xui-tag>

      <nav class="ms-6 hidden items-center gap-1 lg:flex" aria-label="Main">
        @for (item of nav; track item.path) {
          <a
            xuiButton
            variant="ghost"
            size="sm"
            [routerLink]="item.path"
            routerLinkActive="text-foreground bg-surface-raised"
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
    </div>
  `
})
export class SiteHeader {
  protected readonly layout = inject(LayoutState);
  protected readonly theme = inject(Theme);
  protected readonly nav = NAV;
  protected readonly version = VERSION;

  /** Only the docs pages have a sidebar to open. */
  readonly showMenuButton = input(false);
}
