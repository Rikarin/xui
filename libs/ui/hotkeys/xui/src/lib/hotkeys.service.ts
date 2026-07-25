import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { XuiDialogService } from '@xui/dialog';
import { comboMatchesEvent, parseCombo, type XuiHotkey } from './hotkey';
import { XuiHotkeysDialog } from './hotkeys-dialog';

const TEXT_INPUT = /^(input|textarea|select)$/i;

const isTextTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  return !!el && (TEXT_INPUT.test(el.tagName) || el.isContentEditable);
};

/**
 * Global keyboard-shortcut registry and dispatcher, plus a `?`-triggered help
 * dialog. Register shortcuts declaratively with {@link injectHotkeys}, or via
 * `register()` for a manually-managed lifetime.
 */
@Injectable({ providedIn: 'root' })
export class XuiHotkeysService {
  private readonly document = inject(DOCUMENT);
  private readonly dialogs = inject(XuiDialogService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly registry = signal<XuiHotkey[]>([]);
  private helpOpen = false;
  private listening = false;

  readonly isMac = this.isBrowser && /mac|iphone|ipad|ipod/i.test(this.document.defaultView?.navigator.platform ?? '');

  /** All registered hotkeys (deduped by combo would hide overrides, so kept raw). */
  readonly hotkeys = this.registry.asReadonly();

  /** Hotkeys grouped by their `group` for the help dialog. */
  readonly grouped = computed(() => {
    const groups = new Map<string, XuiHotkey[]>();
    for (const hotkey of this.registry()) {
      const key = hotkey.group ?? 'General';
      const list = groups.get(key) ?? [];
      list.push(hotkey);
      groups.set(key, list);
    }
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  });

  /** Register hotkeys and return a disposer that removes them again. */
  register(hotkeys: XuiHotkey[]): () => void {
    this.registry.update(list => [...list, ...hotkeys]);
    this.ensureListener();

    return () => this.registry.update(list => list.filter(h => !hotkeys.includes(h)));
  }

  /** Open (or focus) the generated shortcuts help dialog. */
  openHelp(): void {
    if (this.helpOpen) {
      return;
    }

    this.helpOpen = true;
    const ref = this.dialogs.open(XuiHotkeysDialog, { size: 'md', ariaLabel: 'Keyboard shortcuts' });
    ref.closed.finally(() => (this.helpOpen = false));
  }

  private ensureListener(): void {
    if (this.listening || !this.isBrowser) {
      return;
    }

    this.listening = true;
    this.document.addEventListener('keydown', this.handleKeydown);
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // `?` opens help from anywhere outside a text field.
    if (event.key === '?' && !isTextTarget(event.target)) {
      event.preventDefault();
      this.openHelp();
      return;
    }

    const inText = isTextTarget(event.target);
    for (const hotkey of this.registry()) {
      if (inText && !hotkey.allowInInput) {
        continue;
      }

      if (comboMatchesEvent(parseCombo(hotkey.combo), event, this.isMac)) {
        if (hotkey.preventDefault !== false) {
          event.preventDefault();
        }
        hotkey.onKeyDown(event);
        return;
      }
    }
  };
}

/**
 * Register hotkeys for the lifetime of the current component/directive. They are
 * removed automatically on destroy.
 *
 * ```ts
 * injectHotkeys([
 *   { combo: 'mod+s', label: 'Save', group: 'File', onKeyDown: () => this.save() }
 * ]);
 * ```
 */
export function injectHotkeys(hotkeys: XuiHotkey[]): XuiHotkeysService {
  const service = inject(XuiHotkeysService);
  const destroyRef = inject(DestroyRef);
  const dispose = service.register(hotkeys);
  destroyRef.onDestroy(dispose);
  return service;
}
