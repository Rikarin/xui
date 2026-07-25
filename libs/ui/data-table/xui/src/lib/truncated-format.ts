import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Truncates a long cell value to `length` characters, appending an ellipsis and a
 * `title` tooltip with the full text. When `showExpand` is set (the default), a
 * "more"/"less" toggle reveals or re-collapses the full value inline.
 *
 * ```html
 * <ng-template xuiDataCell let-value>
 *   <xui-truncated-format [value]="value" [length]="60" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'xui-truncated-format',
  template: `
    <span [class]="textClass()" [attr.title]="truncated() ? full() : null">{{ shown() }}</span>
    @if (truncated() && showExpand()) {
      <button type="button" [class]="toggleClass()" (click)="toggle()">
        {{ expanded() ? 'less' : 'more' }}
      </button>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTruncatedFormat {
  readonly class = input<ClassValue>('');

  /** The value to render (coerced to a string). */
  readonly value = input<unknown>('');
  /** Maximum characters before truncating. */
  readonly length = input<number, NumberInput>(80, { transform: numberAttribute });
  /** Whether to show an inline "more"/"less" toggle when truncated. */
  readonly showExpand = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  protected readonly expanded = signal(false);

  protected readonly full = computed(() => String(this.value() ?? ''));
  protected readonly truncated = computed(() => this.full().length > this.length());
  protected readonly shown = computed(() =>
    this.expanded() || !this.truncated() ? this.full() : `${this.full().slice(0, this.length())}…`
  );

  protected readonly computedClass = computed(() => xui('inline items-baseline', this.class()));
  protected readonly textClass = computed(() => xui('whitespace-pre-wrap'));
  protected readonly toggleClass = computed(() =>
    xui('text-primary hover:text-primary/80 ms-1 cursor-pointer text-xs font-medium')
  );

  protected toggle(): void {
    this.expanded.update(expanded => !expanded);
  }
}
