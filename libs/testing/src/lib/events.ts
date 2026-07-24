/**
 * Event helpers.
 *
 * All of these dispatch real DOM events rather than calling handlers directly,
 * so host listeners, `preventDefault()` and event bubbling are exercised the way
 * they are in a browser.
 */

export interface KeyOptions {
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  /** Defaults to `keydown`. */
  type?: 'keydown' | 'keyup' | 'keypress';
}

/** Dispatch a keyboard event — `key` is a `KeyboardEvent.key` value, e.g. `'Enter'`, `'ArrowDown'`, `' '`. */
export function dispatchKey(element: Element, key: string, options: KeyOptions = {}): KeyboardEvent {
  const { type = 'keydown', alt = false, ctrl = false, meta = false, shift = false } = options;

  const event = new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    altKey: alt,
    ctrlKey: ctrl,
    metaKey: meta,
    shiftKey: shift
  });

  element.dispatchEvent(event);

  return event;
}

/** Dispatch a mouse event. */
export function dispatchMouse(element: Element, type: string, init: MouseEventInit = {}): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  element.dispatchEvent(event);

  return event;
}

/** Set an input's value and dispatch the `input` event Angular's forms listen for. */
export function typeInto(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Focus an element and dispatch the matching `focus`/`focusin` pair. */
export function focus(element: HTMLElement): void {
  element.focus();
  element.dispatchEvent(new FocusEvent('focus'));
  element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
}

/** Blur an element and dispatch the matching `blur`/`focusout` pair. */
export function blur(element: HTMLElement): void {
  element.blur();
  element.dispatchEvent(new FocusEvent('blur'));
  element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
}
