import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

/**
 * One entry of an {@link XuiNavigationMenu}. Give it a `trigger` label and a
 * `value`. Project an `<ng-template>` to make it a dropdown panel; give it an
 * `href` (and no template) to make it a plain link.
 *
 * The component renders nothing itself — the parent reads its inputs and panel
 * template and lays out the bar.
 */
@Component({
  selector: 'xui-navigation-menu-item',
  template: ``,
  host: {
    class: 'hidden'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiNavigationMenuItem {
  /** The item's key, used by the menu to track which panel is open. Must be unique within the menu. */
  readonly value = input.required<string>();
  /** The label shown in the menu bar. Project content for the panel it opens. */
  readonly trigger = input<string>('');
  /**
   * Turns the item into a plain link rather than a panel trigger. Use it for a top-level entry with nothing beneath
   * it.
   */
  readonly href = input<string>('');

  /** The dropdown panel content; absent for a plain link. */
  readonly content = contentChild(TemplateRef);
  readonly hasPanel = computed(() => this.content() != null);
}
