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
import { xui } from '@xui/core';
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
  imports: [NgTemplateOutlet],
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
                <svg
                  viewBox="0 0 24 24"
                  class="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                  [class.rotate-180]="active() === item.value()"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
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
  encapsulation: ViewEncapsulation.None
})
export class XuiNavigationMenu {
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

  protected triggerClass(open: boolean): string {
    return xui(
      'text-foreground hover:bg-surface-inset flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium select-none',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
      open && 'bg-surface-inset'
    );
  }
  protected readonly linkClass = computed(() =>
    xui(
      'text-foreground hover:bg-surface-inset flex items-center rounded px-3 py-1.5 text-sm font-medium',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus'
    )
  );

  // `pt-2` (not margin) keeps the panel's hitbox contiguous with the bar, so the
  // pointer can cross the visual gap without the menu closing.
  protected readonly viewportClass = computed(() => xui('absolute top-full start-0 z-50 pt-2'));
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay shadow-overlay rounded-lg border p-3')
  );
}
