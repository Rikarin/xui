import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A vertical stack of expandable sections. By default one panel is open at a
 * time; set `multiple` to let several stay open. `value` is the two-way bindable
 * list of open item values.
 *
 * ```html
 * <xui-accordion [(value)]="open">
 *   <xui-accordion-item value="a" title="First">…</xui-accordion-item>
 *   <xui-accordion-item value="b" title="Second">…</xui-accordion-item>
 * </xui-accordion>
 * ```
 */
@Component({
  selector: 'xui-accordion',
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAccordion {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Let several items be open at once. By default opening one closes the rest. */
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** The values of the currently open items. */
  readonly value = model<string[]>([]);

  isExpanded(value: string): boolean {
    return this.value().includes(value);
  }

  toggle(value: string): void {
    const open = this.value();
    if (open.includes(value)) {
      this.value.set(open.filter(v => v !== value));
    } else {
      this.value.set(this.multiple() ? [...open, value] : [value]);
    }
  }

  protected readonly computedClass = computed(() =>
    xui('divide-border border-border block divide-y overflow-hidden rounded-lg border', this.class())
  );
}
