import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createXHoverGate, type XHoverGate } from './hover-gate';

describe('createXHoverGate', () => {
  @Component({ selector: 'x-gate-host', template: '' })
  class GateHost {
    readonly openDelay = signal(100);
    readonly closeDelay = signal(200);
    readonly events: string[] = [];

    readonly gate: XHoverGate = createXHoverGate({
      openDelay: () => this.openDelay(),
      closeDelay: () => this.closeDelay(),
      open: () => this.events.push('open'),
      close: () => this.events.push('close')
    });
  }

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [GateHost] });

    const fixture = TestBed.createComponent(GateHost);
    fixture.detectChanges();

    return fixture;
  }

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('opens only after the open delay', () => {
    const host = setup().componentInstance;

    host.gate.scheduleOpen();
    expect(host.events).toEqual([]);

    jest.advanceTimersByTime(100);
    expect(host.events).toEqual(['open']);
  });

  it('opens synchronously when the open delay is zero', () => {
    const host = setup().componentInstance;
    host.openDelay.set(0);

    host.gate.scheduleOpen();

    expect(host.events).toEqual(['open']);
  });

  it('closes after the close delay, or synchronously at zero', () => {
    const host = setup().componentInstance;

    host.gate.scheduleClose();
    expect(host.events).toEqual([]);
    jest.advanceTimersByTime(200);
    expect(host.events).toEqual(['close']);

    host.closeDelay.set(0);
    host.gate.scheduleClose();
    expect(host.events).toEqual(['close', 'close']);
  });

  it('scheduleOpen cancels a pending close', () => {
    const host = setup().componentInstance;

    host.gate.scheduleClose();
    host.gate.scheduleOpen();
    jest.runOnlyPendingTimers();

    // The pointer came back before the grace period ran out: no close.
    expect(host.events).toEqual(['open']);
  });

  it('scheduleClose cancels a pending open', () => {
    const host = setup().componentInstance;

    host.gate.scheduleOpen();
    host.gate.scheduleClose();
    jest.runOnlyPendingTimers();

    expect(host.events).toEqual(['close']);
  });

  it('keeps the first deadline when open is scheduled twice', () => {
    const host = setup().componentInstance;

    host.gate.scheduleOpen();
    jest.advanceTimersByTime(60);
    host.gate.scheduleOpen();
    jest.advanceTimersByTime(40);

    expect(host.events).toEqual(['open']);
  });

  it('cancelPending drops both timers without firing either callback', () => {
    const host = setup().componentInstance;

    host.gate.scheduleOpen();
    host.gate.cancelPending();
    host.gate.scheduleClose();
    host.gate.cancelPending();
    jest.runOnlyPendingTimers();

    expect(host.events).toEqual([]);
  });

  it('clears pending timers when the injection context is destroyed', () => {
    const fixture = setup();
    const host = fixture.componentInstance;

    host.gate.scheduleOpen();
    fixture.destroy();
    jest.runOnlyPendingTimers();

    expect(host.events).toEqual([]);
  });
});
