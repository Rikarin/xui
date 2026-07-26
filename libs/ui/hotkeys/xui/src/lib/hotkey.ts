// The pure combo logic (parsing, matching, formatting) lives headless in
// `@xui/core/hotkeys`; re-exported here so consumers of the styled package
// keep a single import.
export { formatXCombo, matchesXCombo, parseXCombo, type XParsedCombo } from '@xui/core/hotkeys';

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
