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
  readonly value = input.required<string>();
  readonly trigger = input<string>('');
  readonly href = input<string>('');

  /** The dropdown panel content; absent for a plain link. */
  readonly content = contentChild(TemplateRef);
  readonly hasPanel = computed(() => this.content() != null);
}
