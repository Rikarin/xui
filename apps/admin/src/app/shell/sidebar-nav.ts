import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matInventory2Round,
  matPeopleRound,
  matReceiptLongRound,
  matSettingsRound,
  matSpaceDashboardRound
} from '@ng-icons/material-icons/round';
import { XuiIconImports } from '@xui/icon';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { DataStore } from '../core/data-store';
import { NAV_SECTIONS, type NavItem } from '../core/navigation';

/**
 * The navigation list, rendered twice: pinned in the desktop rail and inside the mobile drawer.
 *
 * One component for both is why the two can never drift, and why `navigate` exists — the drawer
 * needs to close itself on a click that the rail should ignore.
 */
@Component({
  selector: 'app-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgIcon, XuiIconImports, XuiTagImports, XuiTextImports],
  providers: [
    provideIcons({ matSpaceDashboardRound, matPeopleRound, matReceiptLongRound, matInventory2Round, matSettingsRound })
  ],
  host: { class: 'block' },
  template: `
    <nav aria-label="Main">
      @for (section of sections; track section.label) {
        <p
          xuiText
          size="xs"
          weight="semibold"
          color="subtle"
          class="mt-4 mb-1.5 px-3 tracking-wide uppercase first:mt-0"
        >
          {{ section.label }}
        </p>
        <ul class="space-y-0.5">
          @for (item of section.items; track item.path) {
            <li>
              <a
                class="text-foreground-muted hover:bg-hover-overlay hover:text-foreground flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                routerLinkActive="bg-primary-subtle text-primary-emphasis font-medium"
                [routerLink]="item.path"
                (click)="navigate.emit()"
              >
                <ng-icon xui [name]="item.icon" size="sm" />
                <span class="flex-1 truncate">{{ item.label }}</span>
                @if (badge(item); as count) {
                  <xui-tag minimal [color]="item.badge === 'stock' ? 'warning' : 'none'">{{ count }}</xui-tag>
                }
              </a>
            </li>
          }
        </ul>
      }
    </nav>
  `
})
export class SidebarNav {
  /** Emitted on any destination click, so the mobile drawer can close itself. */
  readonly navigate = output<void>();

  protected readonly sections = NAV_SECTIONS;

  private readonly data = inject(DataStore);

  private readonly counts = computed(() => ({
    customers: this.data.customerCount(),
    orders: this.data.openOrderCount(),
    stock: this.data.lowStockCount()
  }));

  /** Zero is not worth a chip, so an empty count renders nothing at all. */
  protected badge(item: NavItem): number | null {
    if (!item.badge) {
      return null;
    }

    const count = this.counts()[item.badge];

    return count > 0 ? count : null;
  }
}
