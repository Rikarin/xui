import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectElementSize, type XElementSize } from './element-size';
import { injectOutsideClick } from './outside-click';
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

describe('injectElementSize', () => {
  @Component({ selector: 'x-size-host', template: '' })
  class SizeHost {
    readonly size = injectElementSize();
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

describe('injectOutsideClick', () => {
  @Component({
    selector: 'x-outside-host',
    template: '<span #ignored></span><button type="button">inside</button>'
  })
  class OutsideHost {
    readonly outside = signal(0);
    readonly ignored = viewChild.required<ElementRef<HTMLElement>>('ignored');

    constructor() {
      injectOutsideClick(() => this.outside.update(count => count + 1));
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
