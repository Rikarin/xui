import type { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiMenuConfig } from './menu.token';

// The one place `pointer-events-none` on a disabled control is load-bearing rather than a habit:
// a menu item is disabled with `aria-disabled` — the WAI-ARIA pattern keeps it focusable, so the
// native attribute is out — and that alone stops nothing. `CdkMenuItem` will not emit `triggered`,
// but a consumer's own `(click)` on the element would fire. The item is therefore inert, and
// carries no `cursor-not-allowed`: an element that takes no pointer events contributes no cursor.
export const menuItemVariants = cva(
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none select-none aria-disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      color: {
        none: 'text-foreground hover:bg-hover-overlay focus-visible:bg-hover-overlay',
        primary: 'text-primary-emphasis hover:bg-primary-subtle focus-visible:bg-primary-subtle',
        success: 'text-success-emphasis hover:bg-success-subtle focus-visible:bg-success-subtle',
        warning: 'text-warning-emphasis hover:bg-warning-subtle focus-visible:bg-warning-subtle',
        error: 'text-error-emphasis hover:bg-error-subtle focus-visible:bg-error-subtle'
      }
    },
    defaultVariants: {
      color: 'none'
    }
  }
);

export type XuiMenuItemColor = NonNullable<VariantProps<typeof menuItemVariants>['color']>;

/**
 * A command in a menu.
 *
 * Put it on a real `<button>` or `<a>` so activation, focus and disabled
 * semantics are the element's own. `CdkMenuItem` supplies `role="menuitem"`,
 * keyboard activation and the `triggered` output; this component adds the icon,
 * the selected checkmark, the colour accent and the submenu affordance.
 *
 * A left cell is always reserved — for the icon, or the checkmark when
 * `selected` — so labels line up whether or not a given row has one.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[xuiMenuItem], a[xuiMenuItem]',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matCheckRound, matChevronRightRound })],
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel: typeaheadLabel'],
      outputs: ['cdkMenuItemTriggered: triggered']
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="flex w-4 shrink-0 items-center justify-center">
      @if (selected()) {
        <ng-icon xui size="sm" name="matCheckRound" />
      } @else if (icon()) {
        <ng-icon xui size="sm" [name]="icon()" />
      }
    </span>

    <span class="flex-1 truncate"><ng-content /></span>

    <!-- Right rail: a shortcut/label, then a chevron when this opens a submenu. -->
    <span class="text-foreground-subtle ms-2 shrink-0 text-xs empty:hidden">
      <ng-content select="[menuItemLabel]" />
    </span>

    @if (hasSubmenu()) {
      <ng-icon xui size="sm" name="matChevronRightRound" class="text-foreground-muted -me-1 shrink-0" />
    }
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiMenuItem {
  // Present only when `xuiMenuTriggerFor` (a `CdkMenuTrigger`) is on the same
  // host, which is exactly how a submenu is declared.
  private readonly submenuTrigger = inject(CdkMenuTrigger, { optional: true, self: true });
  private readonly config = injectXuiMenuConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');

  /** Name of a registered `@ng-icons` icon, shown in the left cell. */
  readonly icon = input<string>();

  /** Draws a checkmark in the left cell — for a chosen option in a menu. */
  readonly selected = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Intent colour of the item, for marking a destructive or otherwise notable action. */
  readonly color = input<XuiMenuItemColor>(this.config.itemColor);

  protected readonly hasSubmenu = computed(() => this.submenuTrigger != null);

  protected readonly computedClass = computed(() => xui(menuItemVariants({ color: this.color() }), this.class()));
}
