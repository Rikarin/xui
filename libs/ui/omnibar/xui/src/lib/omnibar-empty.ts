import { Directive } from '@angular/core';

/** Context handed to the `xuiOmnibarEmpty` template. */
export interface XuiOmnibarEmptyContext {
  /** The query that found nothing. Empty when the palette has only just opened. */
  $implicit: string;

  /** Same as `$implicit`, for templates that would rather name it. */
  query: string;
}

/**
 * Replaces the "no results" row of a `xui-omnibar`.
 *
 * ```html
 * <xui-omnibar [items]="commands()">
 *   <ng-template xuiOmnibarEmpty let-query>
 *     Nothing matches “{{ query }}”. <a href="/docs/search">Search the docs</a> instead?
 *   </ng-template>
 * </xui-omnibar>
 * ```
 *
 * A dead end is the one place a palette can offer somebody a way out, which a
 * fixed string cannot do.
 */
@Directive({ selector: 'ng-template[xuiOmnibarEmpty]', exportAs: 'xuiOmnibarEmpty' })
export class XuiOmnibarEmpty {
  /** Narrows `let-` bindings to {@link XuiOmnibarEmptyContext} in a typed template. */
  static ngTemplateContextGuard(_directive: XuiOmnibarEmpty, _context: unknown): _context is XuiOmnibarEmptyContext {
    return true;
  }
}
