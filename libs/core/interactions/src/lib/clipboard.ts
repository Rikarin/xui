import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, PLATFORM_ID, signal, type Signal } from '@angular/core';

/** Configuration for {@link injectXClipboard}. */
export interface XClipboardOptions {
  /** How long {@link XClipboard.copied} stays `true` after a successful write, in milliseconds. */
  feedbackDuration?: number;
}

/** A clipboard writer with a short-lived "it worked" flag for the button that triggered it. */
export interface XClipboard {
  /**
   * `true` for `feedbackDuration` after a successful write. Reset on the next
   * attempt, so a second copy re-triggers the tick rather than swallowing it.
   */
  readonly copied: Signal<boolean>;

  /** Write `text` and report whether it landed. Never throws. */
  write(text: string): Promise<boolean>;
}

/**
 * Wrap the async clipboard API so callers do not have to guard for SSR, a
 * missing `navigator.clipboard` or a denied permission.
 *
 * ```ts
 * private readonly clipboard = injectXClipboard();
 * // …
 * await this.clipboard.write(this.code());
 * ```
 *
 * A write that fails resolves `false` rather than rejecting: there is nothing
 * useful to tell the user about an insecure origin or a refused permission, and
 * the caller's job is only to decide whether to show the tick.
 */
export function injectXClipboard(options: XClipboardOptions = {}): XClipboard {
  const { feedbackDuration = 1500 } = options;
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const copied = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  inject(DestroyRef).onDestroy(() => clearTimeout(timer));

  return {
    copied: copied.asReadonly(),

    write: async (text: string): Promise<boolean> => {
      clearTimeout(timer);
      copied.set(false);

      if (!isBrowser || !navigator.clipboard) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false;
      }

      copied.set(true);
      timer = setTimeout(() => copied.set(false), feedbackDuration);

      return true;
    }
  };
}
