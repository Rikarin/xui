import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matDarkModeRound,
  matLightModeRound,
  matLogoutRound,
  matMenuRound,
  matPersonRound,
  matSearchRound,
  matSettingsRound
} from '@ng-icons/material-icons/round';
import { XuiAvatarImports } from '@xui/avatar';
import { XuiButtonImports } from '@xui/button';
import { XuiDrawerImports } from '@xui/drawer';
import { injectHotkeys } from '@xui/hotkeys';
import { XuiIconImports } from '@xui/icon';
import { XuiKbdImports } from '@xui/kbd';
import { XuiMenuImports } from '@xui/menu';
import { XuiTextImports } from '@xui/text';
import { XuiTooltipImports } from '@xui/tooltip';
import { Session } from '../core/session';
import { Theme } from '../core/theme';
import { CommandPalette } from './command-palette';
import { SidebarNav } from './sidebar-nav';

/**
 * The frame every signed-in page renders inside: a fixed navbar, a pinned rail on desktop and the
 * same navigation in a drawer below it.
 *
 * The rail and the drawer share {@link SidebarNav}, and the palette, the rail and the shortcuts all
 * read the one navigation model, so a new page is one entry in `navigation.ts`.
 *
 * `?` opens a generated shortcuts dialog — that comes from `@xui/hotkeys` itself, listing whatever
 * has been registered, so it stays right without being maintained.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterOutlet,
    NgIcon,
    XuiAvatarImports,
    XuiButtonImports,
    XuiDrawerImports,
    XuiIconImports,
    XuiKbdImports,
    XuiMenuImports,
    XuiTextImports,
    XuiTooltipImports,
    CommandPalette,
    SidebarNav
  ],
  providers: [
    provideIcons({
      matMenuRound,
      matSearchRound,
      matLightModeRound,
      matDarkModeRound,
      matPersonRound,
      matSettingsRound,
      matLogoutRound
    })
  ],
  template: `
    <nav xuiNavbar fixedToTop class="z-30">
      <div xuiNavbarGroup align="start" class="gap-2">
        <button
          xuiButton
          variant="ghost"
          size="sm"
          type="button"
          class="lg:hidden"
          aria-label="Open navigation"
          (click)="mobileNav.set(true)"
        >
          <ng-icon xui name="matMenuRound" />
        </button>

        <a routerLink="/dashboard" class="flex items-center gap-2 font-semibold">
          <span class="bg-primary text-primary-foreground grid size-6 place-items-center rounded text-xs">N</span>
          <span class="hidden sm:inline">Northwind</span>
        </a>
      </div>

      <div xuiNavbarGroup align="end" class="gap-1">
        <button
          xuiButton
          variant="outline"
          size="sm"
          type="button"
          class="text-foreground-muted gap-2"
          (click)="palette.set(true)"
        >
          <ng-icon xui name="matSearchRound" />
          <span class="hidden sm:inline">Search</span>
          <kbd xuiKbd class="hidden sm:inline-flex">{{ modKey }}K</kbd>
        </button>

        <button
          xuiButton
          variant="ghost"
          size="sm"
          type="button"
          [xuiTooltip]="theme.mode() === 'dark' ? 'Switch to light' : 'Switch to dark'"
          [attr.aria-label]="theme.mode() === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'"
          (click)="theme.toggle()"
        >
          <ng-icon xui [name]="theme.mode() === 'dark' ? 'matLightModeRound' : 'matDarkModeRound'" />
        </button>

        <button type="button" class="ms-1 rounded-full" aria-label="Account" [xuiMenuTriggerFor]="account">
          <xui-avatar size="sm" [text]="session.user()?.initials ?? '?'" />
        </button>
        <ng-template #account>
          <xui-menu>
            <div class="px-3 py-2">
              <p xuiText size="sm" weight="medium">{{ session.user()?.name }}</p>
              <p xuiText size="xs" color="subtle">{{ session.user()?.email }}</p>
            </div>
            <xui-menu-divider />
            <a xuiMenuItem icon="matPersonRound" routerLink="/settings">Profile</a>
            <a xuiMenuItem icon="matSettingsRound" routerLink="/settings">Settings</a>
            <xui-menu-divider />
            <button xuiMenuItem icon="matLogoutRound" color="error" (click)="signOut()">Sign out</button>
          </xui-menu>
        </ng-template>
      </div>
    </nav>

    <div class="flex pt-12">
      <aside
        class="border-border sticky top-12 hidden h-[calc(100svh-3rem)] w-60 shrink-0 overflow-y-auto border-e p-3 lg:block"
      >
        <app-sidebar-nav />
      </aside>

      <main id="main" class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <router-outlet />
      </main>
    </div>

    <xui-drawer [(open)]="mobileNav" position="left" size="sm" title="Northwind">
      <div class="p-3">
        <app-sidebar-nav (navigate)="mobileNav.set(false)" />
      </div>
    </xui-drawer>

    <app-command-palette [(open)]="palette" />
  `
})
export class Shell {
  protected readonly theme = inject(Theme);
  protected readonly session = inject(Session);

  private readonly router = inject(Router);

  protected readonly mobileNav = signal(false);
  protected readonly palette = signal(false);

  /**
   * Two shortcuts, not the usual dozen.
   *
   * `g d`-style sequences are what an admin normally binds for navigation, and `XuiHotkey.combo`
   * lists `g h` among its examples — but `parseXCombo` only splits on `+`, so a sequence is parsed
   * as one key named "g d" and can never match. It would fail silently while still appearing in the
   * generated help dialog, which is worse than not offering it. The palette covers the same ground:
   * ⌘K, type three letters, Enter.
   */
  private readonly hotkeys = injectHotkeys([
    {
      combo: 'mod+k',
      label: 'Open the command palette',
      group: 'General',
      // The one shortcut that has to work while a field has focus — it is how you leave the field.
      allowInInput: true,
      onKeyDown: () => this.palette.set(true)
    },
    {
      combo: 'mod+shift+l',
      label: 'Toggle the theme',
      group: 'General',
      allowInInput: true,
      onKeyDown: () => this.theme.toggle()
    }
  ]);

  protected readonly modKey = this.hotkeys.isMac ? '⌘' : 'Ctrl ';

  protected signOut(): void {
    this.session.signOut();
    this.go('/sign-in');
  }

  private go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
