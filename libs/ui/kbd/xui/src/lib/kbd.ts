import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiKbdConfig } from './kbd.token';

export const kbdVariants = cva(
  'inline-flex select-none items-center justify-center gap-1 whitespace-nowrap rounded border border-border bg-surface-inset font-medium text-foreground-muted',
  {
    variants: {
      size: {
        sm: 'h-4 min-w-4 px-1 text-[10px]',
        md: 'h-5 min-w-5 px-1.5 text-xs',
        lg: 'h-6 min-w-6 px-2 text-sm'
      }
    },
    defaultVariants: { size: 'md' }
  }
);
export type XuiKbdVariants = VariantProps<typeof kbdVariants>;

/**
 * A keyboard-key cap. Put it on a `<kbd>` for the right semantics; chain several
 * to spell a shortcut. Pairs with `@xui/hotkeys` for the binding side.
 *
 * ```html
 * <kbd xuiKbd>⌘</kbd><kbd xuiKbd>K</kbd>
 * ```
 */
@Directive({
  selector: 'kbd[xuiKbd], [xuiKbd]',
  exportAs: 'xuiKbd',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiKbd {
  private readonly config = injectXuiKbdConfig();

  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Key size, matched to the text it sits beside. */
  readonly size = input<XuiKbdVariants['size']>(this.config.size);

  protected readonly computedClass = computed(() => xui(kbdVariants({ size: this.size() }), this.class()));
}
