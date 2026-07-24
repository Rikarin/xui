import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const headingVariants = cva('text-foreground font-semibold text-balance', {
  variants: {
    level: {
      1: 'text-3xl leading-tight tracking-tight',
      2: 'text-2xl leading-tight tracking-tight',
      3: 'text-xl leading-snug',
      4: 'text-lg leading-snug',
      5: 'text-base leading-normal',
      6: 'text-sm leading-normal tracking-wide uppercase'
    }
  },
  defaultVariants: {
    level: 1
  }
});

export type HeadingVariants = VariantProps<typeof headingVariants>;
export type HeadingLevel = NonNullable<HeadingVariants['level']>;

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/**
 * Typographic styling for a heading element.
 *
 * ```html
 * <h1 xuiHeading>Page title</h1>
 * <h2 xuiHeading [level]="4">Looks like an h4, still an h2 in the outline</h2>
 * ```
 *
 * A directive rather than a component so the document keeps a real `<h1>`–`<h6>`:
 * the heading level is what assistive technology navigates by, and it must not
 * depend on a styling choice. `level` therefore only changes the appearance.
 */
@Directive({
  selector: 'h1[xuiHeading],h2[xuiHeading],h3[xuiHeading],h4[xuiHeading],h5[xuiHeading],h6[xuiHeading]',
  exportAs: 'xuiHeading',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiHeading {
  private readonly hostLevel = levelOf(inject(ElementRef).nativeElement);

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');

  /** Overrides the visual size. Defaults to the host element's own level. */
  readonly level = input<HeadingLevel | null>(null);

  protected readonly computedClass = computed(() =>
    xui(headingVariants({ level: this.level() ?? this.hostLevel }), this.class())
  );
}

function levelOf(element: HTMLElement): HeadingLevel {
  const index = HEADING_TAGS.indexOf(element.tagName.toLowerCase());

  return index === -1 ? 1 : ((index + 1) as HeadingLevel);
}
