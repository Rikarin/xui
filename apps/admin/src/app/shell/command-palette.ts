import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matDarkModeRound,
  matInventory2Round,
  matLightModeRound,
  matLogoutRound,
  matPeopleRound,
  matPersonRound,
  matReceiptLongRound,
  matSettingsRound,
  matSpaceDashboardRound
} from '@ng-icons/material-icons/round';
import { XuiIconImports } from '@xui/icon';
import { XuiOmnibarImports } from '@xui/omnibar';
import { XuiSelectImports } from '@xui/select';
import { DataStore } from '../core/data-store';
import { NAV_ITEMS } from '../core/navigation';
import { Session } from '../core/session';
import { Theme } from '../core/theme';

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: string;
  /** Everything the query should match against, lower-cased once at build time. */
  haystack: string;
  run: () => void;
}

/**
 * ⌘K. Every destination, plus the actions worth reaching without the mouse, plus every customer by
 * name.
 *
 * The destinations are read from the one navigation model the sidebar uses, so a new page appears
 * here without anyone having to remember. The customers are appended live from the store, which is
 * what makes the palette worth opening rather than a second copy of the menu.
 */
@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, XuiIconImports, XuiOmnibarImports, XuiSelectImports],
  providers: [
    provideIcons({
      matSpaceDashboardRound,
      matPeopleRound,
      matReceiptLongRound,
      matInventory2Round,
      matSettingsRound,
      matPersonRound,
      matLightModeRound,
      matDarkModeRound,
      matLogoutRound
    })
  ],
  template: `
    <xui-omnibar
      aria-label="Command palette"
      placeholder="Jump to a page, a customer, or run a command…"
      noResultsText="Nothing matches that."
      [items]="commands()"
      [itemText]="text"
      [itemPredicate]="matches"
      [(isOpen)]="isOpen"
      (itemSelect)="run($event)"
    >
      <ng-template xuiSelectOption let-item>
        @let command = asCommand(item);
        <span class="flex w-full items-center gap-3">
          <ng-icon xui [name]="command.icon" size="sm" class="text-foreground-muted" />
          <span class="min-w-0 flex-1 truncate">{{ command.label }}</span>
          <span class="text-foreground-subtle shrink-0 text-xs">{{ command.hint }}</span>
        </span>
      </ng-template>
    </xui-omnibar>
  `
})
export class CommandPalette {
  readonly isOpen = model(false);

  private readonly router = inject(Router);
  private readonly data = inject(DataStore);
  private readonly theme = inject(Theme);
  private readonly session = inject(Session);

  protected readonly commands = computed<Command[]>(() => [
    ...NAV_ITEMS.map(item => ({
      id: `go:${item.path}`,
      label: item.label,
      hint: 'Go to',
      icon: item.icon,
      haystack: `${item.label} ${item.keywords ?? ''}`.toLowerCase(),
      run: () => void this.router.navigateByUrl(item.path)
    })),
    {
      id: 'theme',
      label: this.theme.mode() === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme',
      hint: 'Command',
      icon: this.theme.mode() === 'dark' ? 'matLightModeRound' : 'matDarkModeRound',
      haystack: 'theme dark light appearance contrast',
      run: () => this.theme.toggle()
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      hint: 'Command',
      icon: 'matLogoutRound',
      haystack: 'sign out log out leave session',
      run: () => {
        this.session.signOut();
        void this.router.navigateByUrl('/sign-in');
      }
    },
    ...this.data.customers().map(customer => ({
      id: `cus:${customer.id}`,
      label: customer.name,
      hint: customer.company,
      icon: 'matPersonRound',
      haystack: `${customer.name} ${customer.email} ${customer.company}`.toLowerCase(),
      run: () => void this.router.navigate(['/customers'], { queryParams: { id: customer.id } })
    }))
  ]);

  /**
   * The omnibar hands its item template an `unknown` — it does not thread its own generic through
   * to the content child — so the template names the type back rather than reaching for `$any`.
   */
  protected asCommand(item: unknown): Command {
    return item as Command;
  }

  protected readonly text = (command: Command): string => command.label;

  protected readonly matches = (query: string, command: Command): boolean =>
    command.haystack.includes(query.toLowerCase());

  protected run(command: Command): void {
    this.isOpen.set(false);
    command.run();
  }
}
