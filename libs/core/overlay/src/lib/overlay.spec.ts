import { Component, ElementRef, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectXOverlay, type XOverlayFactory } from './overlay';
import type { XOverlayConfig } from './overlay-config';

@Component({
  selector: 'x-overlay-host',
  template: `
    <button #trigger type="button">Open</button>
    <ng-template #content>
      <div class="overlay-content"><button type="button" class="inner">Inner</button></div>
    </ng-template>
  `
})
class OverlayHost {
  readonly overlay: XOverlayFactory = injectXOverlay();
  readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  open<T = unknown>(config: XOverlayConfig = {}) {
    return this.overlay.open<T>(this.content(), { origin: this.trigger(), ...config });
  }
}

function setup() {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [OverlayHost] });

  const fixture = TestBed.createComponent(OverlayHost);
  fixture.detectChanges();

  return fixture;
}

const pane = () => document.querySelector('.cdk-overlay-pane');

describe('injectXOverlay', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(node => node.remove());
  });

  it('attaches template content to an overlay pane', () => {
    const fixture = setup();

    fixture.componentInstance.open();

    expect(pane()?.querySelector('.overlay-content')).toBeTruthy();
  });

  it('reports the overlay as open and tracks it in the registry', () => {
    const fixture = setup();

    const ref = fixture.componentInstance.open();

    expect(ref.isOpen()).toBe(true);
    expect(fixture.componentInstance.overlay.openRefs).toHaveLength(1);
  });

  it('detaches, deregisters and resolves the close promise on close', async () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open<string>();

    ref.close('confirmed');

    await expect(ref.closed).resolves.toBe('confirmed');
    expect(ref.isOpen()).toBe(false);
    expect(ref.result()).toBe('confirmed');
    expect(pane()).toBeNull();
    expect(fixture.componentInstance.overlay.openRefs).toHaveLength(0);
  });

  it('ignores a second close', async () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open<string>();

    ref.close('first');
    ref.close('second');

    await expect(ref.closed).resolves.toBe('first');
    expect(ref.result()).toBe('first');
  });

  it('closes on Escape by default', () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open();

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(ref.isOpen()).toBe(false);
  });

  it('stays open on Escape when the option is off', () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open({ closeOnEscape: false });

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));

    expect(ref.isOpen()).toBe(true);
  });

  it('closes on an outside pointer event', () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(ref.isOpen()).toBe(false);
  });

  it('does not close when the pointer event lands on the trigger', () => {
    const fixture = setup();
    const trigger = fixture.componentInstance.trigger().nativeElement;
    const ref = fixture.componentInstance.open();

    trigger.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Otherwise a toggle handler on the trigger would reopen what this just
    // closed, and the overlay would flicker instead of toggling.
    expect(ref.isOpen()).toBe(true);
  });

  it('applies the accessibility attributes to the pane', () => {
    const fixture = setup();

    fixture.componentInstance.open({ role: 'dialog', ariaLabel: 'Settings' });

    expect(pane()?.getAttribute('role')).toBe('dialog');
    expect(pane()?.getAttribute('aria-label')).toBe('Settings');
  });

  it('marks a backdropped focus-trapping dialog as modal and inerts the background', () => {
    const fixture = setup();

    const ref = fixture.componentInstance.open({
      role: 'dialog',
      ariaLabel: 'Settings',
      hasBackdrop: true,
      trapFocus: true
    });

    expect(pane()?.getAttribute('aria-modal')).toBe('true');

    // Everything in the body except the CDK overlay container is hidden from AT.
    const container = document.querySelector('.cdk-overlay-container')!;
    const siblings = [...document.body.children].filter(node => node !== container);
    expect(siblings.length).toBeGreaterThan(0);
    expect(siblings.every(node => node.hasAttribute('inert'))).toBe(true);

    ref.close();
    expect(siblings.some(node => node.hasAttribute('inert'))).toBe(false);
  });

  it('leaves a trapping overlay with no backdrop non-modal', () => {
    const fixture = setup();

    // A `role="dialog"` popover traps Tab but still closes on outside clicks,
    // which `inert` would swallow.
    fixture.componentInstance.open({ role: 'dialog', ariaLabel: 'Filters', trapFocus: true });

    expect(pane()?.getAttribute('aria-modal')).toBeNull();

    const container = document.querySelector('.cdk-overlay-container')!;
    const siblings = [...document.body.children].filter(node => node !== container);
    expect(siblings.some(node => node.hasAttribute('inert'))).toBe(false);
  });

  it('only emits aria-modal on dialog roles', () => {
    const fixture = setup();

    fixture.componentInstance.open({ role: 'listbox', hasBackdrop: true, trapFocus: true });

    expect(pane()?.getAttribute('aria-modal')).toBeNull();
  });

  it('restores focus to the previously focused element', () => {
    const fixture = setup();
    const trigger = fixture.componentInstance.trigger().nativeElement;
    document.body.appendChild(trigger);
    trigger.focus();

    const ref = fixture.componentInstance.open();
    (pane()?.querySelector('.inner') as HTMLElement | null)?.focus();
    ref.close();

    expect(document.activeElement).toBe(trigger);
  });

  it('leaves focus alone when restoreFocus is off', () => {
    const fixture = setup();
    const trigger = fixture.componentInstance.trigger().nativeElement;
    document.body.appendChild(trigger);
    trigger.focus();

    const ref = fixture.componentInstance.open({ restoreFocus: false });
    const inner = pane()?.querySelector('.inner') as HTMLElement;
    document.body.appendChild(inner);
    inner.focus();
    ref.close();

    expect(document.activeElement).toBe(inner);
  });

  it('matches the origin width when asked', () => {
    const fixture = setup();
    const trigger = fixture.componentInstance.trigger().nativeElement;
    jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ width: 240 } as DOMRect);

    fixture.componentInstance.open({ matchOriginWidth: true });

    expect((pane() as HTMLElement).style.width).toBe('240px');
  });

  it('throws when a connected overlay has no origin', () => {
    const fixture = setup();

    expect(() =>
      fixture.componentInstance.overlay.open(fixture.componentInstance.content(), { position: 'connected' })
    ).toThrow(/needs an `origin`/);
  });

  it('closeAll closes every open overlay', () => {
    const fixture = setup();
    const first = fixture.componentInstance.open();
    const second = fixture.componentInstance.open();

    fixture.componentInstance.overlay.closeAll();

    expect(first.isOpen()).toBe(false);
    expect(second.isOpen()).toBe(false);
    expect(fixture.componentInstance.overlay.openRefs).toHaveLength(0);
  });

  it('closes anything still open when the host is destroyed', () => {
    const fixture = setup();
    const ref = fixture.componentInstance.open();

    fixture.destroy();

    expect(ref.isOpen()).toBe(false);
    expect(pane()).toBeNull();
  });

  describe('exit animation', () => {
    it('keeps the overlay on screen, and inert to the pointer, until the exit settles', async () => {
      let finish!: () => void;
      const playing = new Promise<void>(resolve => (finish = () => resolve()));
      const fixture = setup();
      const ref = fixture.componentInstance.open({ exit: () => playing });

      ref.close();

      // Closed from this moment, but not yet gone.
      expect(ref.isOpen()).toBe(false);
      expect(pane()).not.toBeNull();
      expect((pane() as HTMLElement).style.pointerEvents).toBe('none');

      finish();
      await ref.closed;

      expect(pane()).toBeNull();
    });

    it('tears down at once when the exit returns nothing — reduced motion, or no animation to wait on', () => {
      const fixture = setup();
      const ref = fixture.componentInstance.open({ exit: () => undefined });

      ref.close();

      expect(pane()).toBeNull();
    });

    it('tears down anyway when the exit never settles', async () => {
      jest.useFakeTimers();

      try {
        const fixture = setup();
        const ref = fixture.componentInstance.open({ exit: () => new Promise<void>(() => undefined) });

        ref.close();
        expect(pane()).not.toBeNull();

        // Async, so the promise the timeout settles gets its microtasks flushed too.
        await jest.advanceTimersByTimeAsync(1000);

        expect(pane()).toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });

    it('skips the exit when the host is destroyed, which takes the content with it', () => {
      const fixture = setup();
      const exit = jest.fn(() => new Promise<void>(() => undefined));
      fixture.componentInstance.open({ exit });

      fixture.destroy();

      expect(exit).not.toHaveBeenCalled();
      expect(pane()).toBeNull();
    });
  });
});
