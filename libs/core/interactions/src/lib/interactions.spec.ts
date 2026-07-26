import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectXElementSize, type XElementSize } from './element-size';
import { injectXOutsideClick } from './outside-click';
import { injectXPointerDrag, type XPointerDragStartFn } from './pointer-drag';
import { XResizeSensor } from './resize-sensor';

/** Captures the observer so a test can drive it, since jsdom has no layout. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.disconnected = true;
  }

  emit(size: XElementSize) {
    this.callback([{ contentRect: size } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
}

beforeEach(() => {
  FakeResizeObserver.instances = [];
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;
});

const latestObserver = () => FakeResizeObserver.instances[FakeResizeObserver.instances.length - 1];

describe('injectXElementSize', () => {
  @Component({ selector: 'x-size-host', template: '' })
  class SizeHost {
    readonly size = injectXElementSize();
  }

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [SizeHost] });

    const fixture = TestBed.createComponent(SizeHost);
    fixture.detectChanges();

    return fixture;
  }

  it('starts at zero before the first measurement', () => {
    expect(setup().componentInstance.size()).toEqual({ width: 0, height: 0 });
  });

  it('observes the host element', () => {
    const fixture = setup();

    expect(latestObserver().observed).toContain(fixture.nativeElement);
  });

  it('tracks the observed content-box size', () => {
    const fixture = setup();

    latestObserver().emit({ width: 320, height: 48 });

    expect(fixture.componentInstance.size()).toEqual({ width: 320, height: 48 });
  });

  it('disconnects when the host is destroyed', () => {
    const fixture = setup();
    const observer = latestObserver();

    fixture.destroy();

    expect(observer.disconnected).toBe(true);
  });

  it('stays at zero when ResizeObserver is unavailable', () => {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;

    expect(setup().componentInstance.size()).toEqual({ width: 0, height: 0 });
  });
});

describe('XResizeSensor', () => {
  @Component({
    selector: 'x-sensor-host',
    imports: [XResizeSensor],
    template: '<div xResizeSensor (xResize)="sizes.set([...sizes(), $event])"></div>'
  })
  class SensorHost {
    readonly sizes = signal<XElementSize[]>([]);
  }

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [SensorHost] });

    const fixture = TestBed.createComponent(SensorHost);
    fixture.detectChanges();

    return fixture;
  }

  it('does not emit the initial unmeasured size', () => {
    expect(setup().componentInstance.sizes()).toEqual([]);
  });

  it('emits when the element is measured', () => {
    const fixture = setup();

    latestObserver().emit({ width: 100, height: 20 });
    fixture.detectChanges();

    expect(fixture.componentInstance.sizes()).toEqual([{ width: 100, height: 20 }]);
  });

  it('does not re-emit an unchanged size', () => {
    const fixture = setup();

    latestObserver().emit({ width: 100, height: 20 });
    fixture.detectChanges();
    latestObserver().emit({ width: 100, height: 20 });
    fixture.detectChanges();

    expect(fixture.componentInstance.sizes()).toHaveLength(1);
  });
});

describe('injectXOutsideClick', () => {
  @Component({
    selector: 'x-outside-host',
    template: '<span #ignored></span><button type="button">inside</button>'
  })
  class OutsideHost {
    readonly outside = signal(0);
    readonly ignored = viewChild.required<ElementRef<HTMLElement>>('ignored');

    constructor() {
      injectXOutsideClick(() => this.outside.update(count => count + 1));
    }
  }

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [OutsideHost] });

    const fixture = TestBed.createComponent(OutsideHost);
    fixture.detectChanges();

    return fixture;
  }

  it('fires for an event outside the host', () => {
    const fixture = setup();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(fixture.componentInstance.outside()).toBe(1);
  });

  it('ignores an event inside the host', () => {
    const fixture = setup();

    fixture.nativeElement.querySelector('button').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(fixture.componentInstance.outside()).toBe(0);
  });

  it('ignores an event on a detached node', () => {
    const fixture = setup();
    const orphan = document.createElement('div');

    orphan.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(fixture.componentInstance.outside()).toBe(0);
  });

  it('stops listening once the host is destroyed', () => {
    const fixture = setup();

    fixture.destroy();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(fixture.componentInstance.outside()).toBe(0);
  });
});

describe('injectXPointerDrag', () => {
  @Component({ selector: 'x-drag-host', template: '' })
  class DragHost {
    readonly startDrag: XPointerDragStartFn = injectXPointerDrag();
  }

  // jsdom has no PointerEvent; the listeners are by name, so a MouseEvent lands.
  const pointer = (type: string, init: MouseEventInit = {}) =>
    document.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }));

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [DragHost] });

    const fixture = TestBed.createComponent(DragHost);
    fixture.detectChanges();

    return fixture;
  }

  const press = () => new MouseEvent('pointerdown', { bubbles: true });

  it('reports every pointer move until release', () => {
    const fixture = setup();
    const moves: number[] = [];

    fixture.componentInstance.startDrag(press(), { onMove: event => moves.push(event.clientX) });
    pointer('pointermove', { clientX: 10 });
    pointer('pointermove', { clientX: 20 });

    expect(moves).toEqual([10, 20]);
  });

  it('fires onEnd on pointerup and stops tracking afterwards', () => {
    const fixture = setup();
    const onMove = jest.fn();
    const onEnd = jest.fn();

    fixture.componentInstance.startDrag(press(), { onMove, onEnd });
    pointer('pointerup', { clientX: 30 });
    pointer('pointermove', { clientX: 40 });
    pointer('pointerup');

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd.mock.calls[0][0].clientX).toBe(30);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('treats pointercancel as the end of the drag', () => {
    const fixture = setup();
    const onEnd = jest.fn();

    fixture.componentInstance.startDrag(press(), { onMove: jest.fn(), onEnd });
    pointer('pointercancel');

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('the returned stop detaches the listeners without firing onEnd', () => {
    const fixture = setup();
    const onMove = jest.fn();
    const onEnd = jest.fn();

    const stop = fixture.componentInstance.startDrag(press(), { onMove, onEnd });
    stop();
    pointer('pointermove', { clientX: 10 });
    pointer('pointerup');

    expect(onMove).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('starting a new drag replaces the previous one', () => {
    const fixture = setup();
    const first = jest.fn();
    const second = jest.fn();

    fixture.componentInstance.startDrag(press(), { onMove: first });
    fixture.componentInstance.startDrag(press(), { onMove: second });
    pointer('pointermove', { clientX: 10 });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('tears the drag down when the host is destroyed mid-drag', () => {
    const fixture = setup();
    const onMove = jest.fn();
    const onEnd = jest.fn();

    fixture.componentInstance.startDrag(press(), { onMove, onEnd });
    fixture.destroy();
    pointer('pointermove', { clientX: 10 });
    pointer('pointerup');

    expect(onMove).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('captures and releases the pointer on the pressed element when supported', () => {
    const fixture = setup();
    const target = document.createElement('div');
    let captured = false;
    target.setPointerCapture = jest.fn(() => {
      captured = true;
    });
    target.hasPointerCapture = jest.fn(() => captured);
    target.releasePointerCapture = jest.fn(() => {
      captured = false;
    });

    const event = { pointerId: 7, target } as unknown as PointerEvent;
    fixture.componentInstance.startDrag(event, { onMove: jest.fn() });

    expect(target.setPointerCapture).toHaveBeenCalledWith(7);

    pointer('pointerup');

    expect(target.releasePointerCapture).toHaveBeenCalledWith(7);
  });
});
