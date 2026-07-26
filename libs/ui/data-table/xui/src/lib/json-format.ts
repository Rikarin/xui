import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiTruncatedFormat } from './truncated-format';

/**
 * Renders a cell value as JSON in a monospace `<code>`, truncated past `length`
 * characters (via {@link XuiTruncatedFormat}). `omitQuotes` prints a plain string
 * value without the surrounding quotes; `pretty` indents the output.
 *
 * ```html
 * <ng-template xuiDataCell let-value>
 *   <xui-json-format [value]="value" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'xui-json-format',
  imports: [XuiTruncatedFormat],
  template: `<code [class]="codeClass()"
    ><xui-truncated-format [value]="json()" [length]="length()" [showExpand]="showExpand()"
  /></code>`,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiJsonFormat {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The value to serialize as JSON. */
  readonly value = input<unknown>(null);
  /** Print a plain-string value without surrounding quotes. */
  readonly omitQuotes = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Indent the JSON with two spaces. */
  readonly pretty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Maximum characters before truncating. */
  readonly length = input<number, NumberInput>(200, { transform: numberAttribute });
  /** Whether the truncated value shows an inline "more"/"less" toggle. */
  readonly showExpand = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  protected readonly json = computed(() => {
    const value = this.value();
    if (value == null) {
      return String(value);
    }
    if (typeof value === 'string' && this.omitQuotes()) {
      return value;
    }
    try {
      return JSON.stringify(value, null, this.pretty() ? 2 : undefined) ?? String(value);
    } catch {
      return String(value);
    }
  });

  protected readonly computedClass = computed(() => xui('block', this.class()));
  protected readonly codeClass = computed(() =>
    xui('bg-surface-inset/60 text-foreground rounded px-1 py-0.5 font-mono text-xs whitespace-pre-wrap')
  );
}
