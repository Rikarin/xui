import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { XuiNavigationMenuItem } from './navigation-menu-item';

/**
 * A horizontal navigation bar where items can open a rich dropdown panel — a
 * "mega menu". Panels open on hover or focus and share one viewport beneath the
 * bar; a padded bridge keeps the panel reachable across the gap. Items with an
 * `href` and no template render as plain links.
 *
 * ```html
 * <xui-navigation-menu>
 *   <xui-navigation-menu-item value="products" trigger="Products">
 *     <ng-template><div class="grid grid-cols-2 gap-2 w-[28rem]">…</div></ng-template>
 *   </xui-navigation-menu-item>
 *   <xui-navigation-menu-item value="pricing" trigger="Pricing" href="/pricing" />
 * </xui-navigation-menu>
 * ```
 */
@Component({
  selector: 'xui-navigation-menu',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  template: `
    <nav [class]="navClass()" (mouseleave)="active.set(null)" (focusout)="onFocusOut($event)">
      <ul class="flex items-center gap-1">
        @for (item of items(); track item.value()) {
          <li>
            @if (item.hasPanel()) {
              <button
                type="button"
                [class]="triggerClass(active() === item.value())"
                [attr.aria-expanded]="active() === item.value()"
                (mouseenter)="active.set(item.value())"
                (focus)="active.set(item.value())"
                (click)="toggle(item.value())"
              >
                {{ item.trigger() }}
                <ng-icon
                  xui
                  name="matExpandMoreRound"
                  size="sm"
                  class="shrink-0 transition-transform duration-200"
                  [class.rotate-180]="active() === item.value()"
                />
              </button>
            } @else {
              <a [attr.href]="item.href() || null" [class]="linkClass()" (mouseenter)="active.set(null)">
                {{ item.trigger() }}
              </a>
            }
          </li>
        }
      </ul>

      @if (activeItem(); as item) {
        <div [class]="viewportClass()">
          <div [class]="panelClass()">
            <ng-container [ngTemplateOutlet]="item.content()!" />
          </div>
        </div>
      }
    </nav>

    <ng-content />
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matExpandMoreRound })]
})
export class XuiNavigationMenu {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly items = contentChildren(XuiNavigationMenuItem);
  protected readonly active = signal<string | null>(null);

  protected readonly activeItem = computed(() => {
    const value = this.active();
    return this.items().find(item => item.value() === value && item.hasPanel()) ?? null;
  });

  protected toggle(value: string): void {
    this.active.update(current => (current === value ? null : value));
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.active.set(null);
    }
  }

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly navClass = computed(() =>
    xui('border-border bg-surface relative inline-flex rounded-md border p-1')
  );

  // The base layer already draws the focus ring; only the negative offset (the
  // ring must sit inside the bar's border) is stated here.
  protected triggerClass(open: boolean): string {
    return xui(
      'text-foreground hover:bg-surface-inset flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium select-none',
      'focus-visible:-outline-offset-2',
      open && 'bg-surface-inset'
    );
  }
  protected readonly linkClass = computed(() =>
    xui(
      'text-foreground hover:bg-surface-inset flex items-center rounded px-3 py-1.5 text-sm font-medium',
      'focus-visible:-outline-offset-2'
    )
  );

  // `pt-2` (not margin) keeps the panel's hitbox contiguous with the bar, so the
  // pointer can cross the visual gap without the menu closing — that hover
  // bridge is why this panel stays inline instead of moving to the overlay
  // container. `z-10` is local structural stacking (the navbar scale), not an
  // overlay z-index: it only needs to clear in-flow page content below the bar.
  // eslint-disable-next-line local/no-hand-z-index -- local structural stacking on the navbar scale, documented above
  protected readonly viewportClass = computed(() => xui('absolute top-full start-0 z-10 pt-2'));
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay shadow-overlay rounded-lg border p-3')
  );
}
