/**
 * Pure key-combo logic: parsing `mod+s`-style strings, matching them against
 * keyboard events and formatting them for display. DOM-free — the styled
 * `@xui/hotkeys` package owns registration, dispatch and the help dialog.
 */

/** A combo broken into its modifier flags and final key. */
export interface XParsedCombo {
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

const MODIFIER_ALIASES: Record<string, keyof Omit<XParsedCombo, 'key'>> = {
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
export function parseXCombo(combo: string): XParsedCombo {
  const parsed: XParsedCombo = { mod: false, ctrl: false, meta: false, alt: false, shift: false, key: '' };

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
export function matchesXCombo(parsed: XParsedCombo, event: KeyboardEvent, isMac: boolean): boolean {
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
export function formatXCombo(combo: string, isMac: boolean): string[] {
  const parts: string[] = [];
  const parsed = parseXCombo(combo);

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
