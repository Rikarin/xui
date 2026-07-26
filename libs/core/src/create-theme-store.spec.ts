import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createXThemeStore } from './create-theme-store';

describe('createXThemeStore', () => {
  const storageKey = 'xui-test-theme';
  const html = document.documentElement;

  afterEach(() => {
    html.classList.remove('light', 'dark');
    localStorage.removeItem(storageKey);
  });

  function create() {
    return TestBed.runInInjectionContext(() => createXThemeStore({ storageKey }));
  }

  it('reads back the mode the pre-paint script decided from <html>', () => {
    html.classList.add('light');

    expect(create().mode()).toBe('light');
  });

  it('defaults to dark when <html> carries no light class', () => {
    expect(create().mode()).toBe('dark');
  });

  it('mirrors the mode onto <html> and persists it under the storage key', () => {
    const store = create();
    TestBed.tick();

    expect(html.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(storageKey)).toBe('dark');

    store.toggle();
    TestBed.tick();

    expect(html.classList.contains('light')).toBe(true);
    expect(html.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe('light');
  });

  it('accepts a direct mode.set from a settings surface', () => {
    const store = create();

    store.mode.set('light');
    TestBed.tick();

    expect(html.classList.contains('light')).toBe(true);
  });

  it('leaves the document and storage alone on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const store = create();
    store.toggle();
    TestBed.tick();

    expect(html.classList.contains('light')).toBe(false);
    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
