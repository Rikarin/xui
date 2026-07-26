import { formatXCombo, matchesXCombo, parseXCombo } from './hotkeys';

describe('parseXCombo', () => {
  it('splits modifiers from the key and resolves aliases', () => {
    expect(parseXCombo('mod+shift+s')).toMatchObject({ mod: true, shift: true, key: 's' });
    expect(parseXCombo('ctrl+alt+del')).toMatchObject({ ctrl: true, alt: true, key: 'delete' });
    expect(parseXCombo('up')).toMatchObject({ key: 'arrowup' });
  });
});

describe('matchesXCombo', () => {
  it('resolves mod to meta on mac and ctrl elsewhere', () => {
    const combo = parseXCombo('mod+s');

    expect(matchesXCombo(combo, new KeyboardEvent('keydown', { key: 's', metaKey: true }), true)).toBe(true);
    expect(matchesXCombo(combo, new KeyboardEvent('keydown', { key: 's', ctrlKey: true }), true)).toBe(false);
    expect(matchesXCombo(combo, new KeyboardEvent('keydown', { key: 's', ctrlKey: true }), false)).toBe(true);
  });

  it('does not require an explicit shift for punctuation keys', () => {
    const combo = parseXCombo('?');

    expect(matchesXCombo(combo, new KeyboardEvent('keydown', { key: '?', shiftKey: true }), false)).toBe(true);
  });

  it('rejects when an unwanted modifier is held', () => {
    const combo = parseXCombo('s');

    expect(matchesXCombo(combo, new KeyboardEvent('keydown', { key: 's', metaKey: true }), true)).toBe(false);
  });
});

describe('formatXCombo', () => {
  it('renders platform-specific symbols', () => {
    expect(formatXCombo('mod+s', true)).toEqual(['⌘', 'S']);
    expect(formatXCombo('mod+s', false)).toEqual(['Ctrl', 'S']);
    expect(formatXCombo('shift+enter', true)).toEqual(['⇧', 'Enter']);
  });
});
