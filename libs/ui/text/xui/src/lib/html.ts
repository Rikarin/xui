import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Typographic styling for the plain HTML elements prose is made of — blockquote,
 * code, pre, and ordered and unordered lists.
 *
 * Each is a directive on the native element, so the semantics — quotation,
 * code, list — come from the markup rather than from a wrapper component.
 */

/**
 * Base for the one-line "style this element" directives below.
 *
 * Decorated so Angular picks up the inherited `class` input: inputs declared on
 * an undecorated base class are invisible to the template compiler.
 */
@Directive()
export abstract class XuiStyledElement {
  protected abstract readonly baseClass: string;

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui(this.baseClass, this.class()));
}

@Directive({
  selector: 'blockquote[xuiBlockquote]',
  exportAs: 'xuiBlockquote',
  host: { '[class]': 'computedClass()' }
})
export class XuiBlockquote extends XuiStyledElement {
  protected readonly baseClass = 'border-border-strong text-foreground-muted my-2 border-s-4 ps-4 italic';
}

@Directive({
  selector: 'code[xuiCode]',
  exportAs: 'xuiCode',
  host: { '[class]': 'computedClass()' }
})
export class XuiCode extends XuiStyledElement {
  protected readonly baseClass =
    'bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.9em] whitespace-nowrap';
}

@Directive({
  selector: 'pre[xuiCodeBlock]',
  exportAs: 'xuiCodeBlock',
  host: { '[class]': 'computedClass()' }
})
export class XuiCodeBlock extends XuiStyledElement {
  // A `<pre>` holding a `<code>` should not paint the inner element's chrome
  // twice, so the nested code is stripped back to bare text.
  protected readonly baseClass =
    'bg-surface-inset border-border text-foreground my-2 overflow-x-auto rounded-lg border p-3 font-mono text-sm ' +
    '[&_code]:bg-transparent [&_code]:p-0 [&_code]:whitespace-pre';
}

@Directive({
  selector: 'ol[xuiList],ul[xuiList]',
  exportAs: 'xuiList',
  host: { '[class]': 'computedClass()' }
})
export class XuiList extends XuiStyledElement {
  // One directive covers both list types, so the marker style is selected from
  // the host's own tag rather than from an input the caller has to keep in sync.
  protected readonly baseClass =
    'my-2 ps-6 [&:is(ol)]:list-decimal [&:is(ul)]:list-disc [&>li]:mt-1 [&_ol]:my-0 [&_ul]:my-0';
}
