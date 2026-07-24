import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A rule between groups of menu items, with an optional heading.
 *
 * With a `title` it becomes a labelled group header (`role="presentation"` on
 * the rule, the label read as a heading); without one it is a plain
 * `role="separator"` — so assistive tech announces a divider, not an empty item.
 */
@Component({
  selector: 'xui-menu-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title()) {
      <div class="text-foreground-subtle px-2 pt-1.5 pb-0.5 text-xs font-medium tracking-wide uppercase">
        {{ title() }}
      </div>
    } @else {
      <div role="separator" class="bg-border -mx-1 my-1 h-px"></div>
    }
  `,
  host: {
    '[attr.role]': "title() ? 'presentation' : null",
    '[class]': 'computedClass()'
  }
})
export class XuiMenuDivider {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  /** Turns the rule into a labelled section header. */
  readonly title = input<string | null>(null);

  protected readonly computedClass = computed(() => xui('block', this.class()));
}
