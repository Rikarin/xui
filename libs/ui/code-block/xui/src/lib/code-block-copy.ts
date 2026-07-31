import { Directive } from '@angular/core';

/** Context handed to the `xuiCodeBlockCopy` template. */
export interface XuiCodeBlockCopyContext {
  /** Call it to write the visible sample to the clipboard. */
  $implicit: () => void;

  /** Same as `$implicit`, for templates that would rather name it. */
  copy: () => void;

  /** `true` for a moment after a successful write — the tick. */
  copied: boolean;

  /** The text `copy()` would write, in case the template wants to show it. */
  code: string;
}

/**
 * Replaces the copy button in the corner of a `xui-code-block`.
 *
 * ```html
 * <xui-code-block [code]="sample">
 *   <ng-template xuiCodeBlockCopy let-copy let-copied="copied">
 *     <button xuiButton size="sm" (click)="copy()">{{ copied ? 'Copied' : 'Copy' }}</button>
 *   </ng-template>
 * </xui-code-block>
 * ```
 *
 * The template is handed the copy function rather than being expected to reach
 * the clipboard itself, so a custom control still copies exactly the lines that
 * are on screen — including the right tab.
 */
@Directive({ selector: 'ng-template[xuiCodeBlockCopy]', exportAs: 'xuiCodeBlockCopy' })
export class XuiCodeBlockCopy {
  /** Narrows `let-` bindings to {@link XuiCodeBlockCopyContext} in a typed template. */
  static ngTemplateContextGuard(_directive: XuiCodeBlockCopy, _context: unknown): _context is XuiCodeBlockCopyContext {
    return true;
  }
}
