/** A keyboard shortcut registered with the {@link XuiHotkeysService}. */
export interface XuiHotkey {
  /**
   * Key combination, `+`-separated. `mod` resolves to ⌘ on macOS and Ctrl
   * elsewhere. Examples: `mod+s`, `shift+/`, `ctrl+alt+k`, `?`, `g h`.
   */
  combo: string;

  /** Human-readable description shown in the help dialog. */
  label: string;

  /** Optional grouping heading in the help dialog. */
  group?: string;

  /** Also fire while a text field is focused (default `false`). */
  allowInInput?: boolean;

  /** Call `preventDefault()` when the combo fires (default `true`). */
  preventDefault?: boolean;

  /** The handler. */
  onKeyDown: (event: KeyboardEvent) => void;
}

/** A combo broken into its modifier flags and final key. */
export interface ParsedCombo {
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

const MODIFIER_ALIASES: Record<string, keyof Omit<ParsedCombo, 'key'>> = {
  mod: 'mod',
  cmd: 'meta',
  command: 'meta',
  meta: 'meta',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  shift: 'shift'
};

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  spacebar: ' ',
  space: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
  return: 'enter'
};

/** Parse a combo string into modifier flags and a normalized key. */
export function parseCombo(combo: string): ParsedCombo {
  const parsed: ParsedCombo = { mod: false, ctrl: false, meta: false, alt: false, shift: false, key: '' };

  for (const raw of combo.trim().toLowerCase().split('+')) {
    const part = raw.trim();
    if (!part) {
      continue;
    }

    const modifier = MODIFIER_ALIASES[part];
    if (modifier) {
      parsed[modifier] = true;
    } else {
      parsed.key = KEY_ALIASES[part] ?? part;
    }
  }

  return parsed;
}

/**
 * Whether a keyboard event matches a parsed combo. `mod` matches ⌘ on macOS and
 * Ctrl elsewhere. `shift` is only required if the combo asks for it, except that
 * a `?` (which is Shift+/) is matched by its resulting character.
 */
export function comboMatchesEvent(parsed: ParsedCombo, event: KeyboardEvent, isMac: boolean): boolean {
  const wantCtrl = parsed.ctrl || (parsed.mod && !isMac);
  const wantMeta = parsed.meta || (parsed.mod && isMac);

  if (event.ctrlKey !== wantCtrl) {
    return false;
  }
  if (event.metaKey !== wantMeta) {
    return false;
  }
  if (event.altKey !== parsed.alt) {
    return false;
  }

  const key = event.key.toLowerCase();
  // When the combo's key is a punctuation char that already needs shift to type
  // (like `?`), don't also demand an explicit shift flag.
  const keyImpliesShift = parsed.key.length === 1 && /[^a-z0-9 ]/.test(parsed.key);
  if (!keyImpliesShift && event.shiftKey !== parsed.shift) {
    return false;
  }

  return key === parsed.key;
}

/** Format a combo for display, e.g. `mod+s` → `⌘ S` on mac / `Ctrl S` elsewhere. */
export function formatCombo(combo: string, isMac: boolean): string[] {
  const parts: string[] = [];
  const parsed = parseCombo(combo);

  if (parsed.mod) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (parsed.ctrl) {
    parts.push(isMac ? '⌃' : 'Ctrl');
  }
  if (parsed.meta && !parsed.mod) {
    parts.push(isMac ? '⌘' : 'Meta');
  }
  if (parsed.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (parsed.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  const key = parsed.key;
  const label = KEY_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key.replace(/^arrow/, ''));
  parts.push(label);

  return parts;
}

const KEY_LABELS: Record<string, string> = {
  ' ': 'Space',
  escape: 'Esc',
  enter: 'Enter',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→'
};
