import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { xui } from '@xui/core';
import { XUI_POPOVER_CONTENT } from './popover-content';

/**
 * The floating surface a popover's content sits on.
 *
 * The trigger attaches this to the overlay and hands it the content and its
 * options through {@link XUI_POPOVER_CONTENT}. It exists so every overlay preset
 * built on the popover — tooltip, menu, select — shares one surface treatment,
 * styled once here rather than at each call site.
 *
 * `minimal` drops the rounding for a flush, utilitarian panel (menus, select
 * dropdowns); the default is a rounded, shadowed card.
 */
@Component({
  selector: 'xui-popover-panel',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container *ngTemplateOutlet="content.template; context: content.context ?? {}" />`,
  host: {
    '[class]': 'computedClass()',
    // The pane the overlay puts us in is inert; the surface itself is the thing
    // an outside-click check must not miss, so tag it.
    'data-xui-popover': ''
  }
})
export class XuiPopoverPanel {
  protected readonly content = inject(XUI_POPOVER_CONTENT);

  protected readonly computedClass = computed(() =>
    xui(
      'bg-surface-overlay text-foreground border-border block overflow-hidden border shadow-overlay',
      this.content.fillWidth ? 'w-full' : 'max-w-[min(24rem,90vw)]',
      this.content.minimal ? 'rounded-none' : 'rounded-lg',
      this.content.panelClass
    )
  );
}
