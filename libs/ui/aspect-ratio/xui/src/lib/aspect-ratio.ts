import { ChangeDetectionStrategy, Component, computed, input, numberAttribute, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Locks its content to a fixed width : height `ratio`, so media and embeds keep
 * their shape as the column resizes. Give it a width (the default is 100%);
 * the height follows from the ratio.
 *
 * ```html
 * <xui-aspect-ratio [ratio]="16 / 9">
 *   <img src="cover.jpg" alt="" />
 * </xui-aspect-ratio>
 * ```
 */
@Component({
  selector: 'xui-aspect-ratio',
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
    '[style.aspect-ratio]': 'ratio()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAspectRatio {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Width divided by height, e.g. `16 / 9` or `1`. */
  readonly ratio = input(1, { transform: numberAttribute });

  protected readonly computedClass = computed(() =>
    xui(
      'block w-full overflow-hidden [&>*]:h-full [&>*]:w-full [&>img]:object-cover [&>video]:object-cover',
      this.class()
    )
  );
}
