import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@xui/testing';
import { XuiToastService } from '../index';

const toasts = () => [...document.querySelectorAll('xui-toast')];
const messages = () => toasts().map(node => node.querySelector('p')?.textContent?.trim());

/**
 * The service is root-provided and mounts its container on the ApplicationRef,
 * not inside any test fixture — so drive change detection with `tick()`, and
 * reach the singleton through `TestBed.inject`.
 */
const setup = () => {
  render('', {});

  return {
    toaster: TestBed.inject(XuiToastService),
    tick: () => TestBed.inject(ApplicationRef).tick()
  };
};

describe('XuiToastService', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('shows nothing until a toast is raised', () => {
    setup();

    expect(toasts()).toHaveLength(0);
  });

  it('mounts a raised toast into the overlay', () => {
    const { toaster, tick } = setup();

    toaster.show({ message: 'Saved' });
    tick();

    expect(messages()).toEqual(['Saved']);
  });

  it('stacks several, oldest first', () => {
    const { toaster, tick } = setup();

    toaster.show({ message: 'One' });
    toaster.show({ message: 'Two' });
    tick();

    expect(messages()).toEqual(['One', 'Two']);
  });

  it('auto-dismisses after the timeout', () => {
    const { toaster, tick } = setup();

    toaster.show({ message: 'Bye', timeout: 3000 });
    tick();
    expect(messages()).toEqual(['Bye']);

    jest.advanceTimersByTime(3000);
    tick();
    expect(toasts()).toHaveLength(0);
  });

  it('keeps a sticky toast (timeout 0) until dismissed', () => {
    const { toaster, tick } = setup();

    const id = toaster.show({ message: 'Stay', timeout: 0 });
    tick();

    jest.advanceTimersByTime(60_000);
    tick();
    expect(messages()).toEqual(['Stay']);

    toaster.dismiss(id);
    tick();
    expect(toasts()).toHaveLength(0);
  });

  it('dismisses from the close button', () => {
    const { toaster, tick } = setup();

    toaster.show({ message: 'Close me', timeout: 0 });
    tick();

    (toasts()[0].querySelector('button[aria-label="Dismiss"]') as HTMLElement).click();
    tick();

    expect(toasts()).toHaveLength(0);
  });

  it('runs the action, then dismisses', () => {
    const { toaster, tick } = setup();
    let ran = 0;

    toaster.show({ message: 'Undo?', actionText: 'Undo', onAction: () => (ran += 1), timeout: 0 });
    tick();

    (toasts()[0].querySelector('button:not([aria-label])') as HTMLElement).click();
    tick();

    expect(ran).toBe(1);
    expect(toasts()).toHaveLength(0);
  });

  it('drops the oldest past maxToasts', () => {
    const { toaster, tick } = setup();

    // The default cap is 5.
    for (let i = 1; i <= 7; i++) {
      toaster.show({ message: `T${i}`, timeout: 0 });
    }
    tick();

    // A flood must not bury the screen: the two oldest are gone.
    expect(messages()).toEqual(['T3', 'T4', 'T5', 'T6', 'T7']);
  });

  it('colours the icon by color', () => {
    const { toaster, tick } = setup();

    toaster.show({ message: 'Oops', color: 'error', timeout: 0 });
    tick();

    expect(toasts()[0].querySelector('ng-icon')?.className).toContain('text-error-emphasis');
  });
});
