import { Dir } from '@angular/cdk/bidi';
import { Component, type Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  arrowDirection,
  arrowDirectionOnAxis,
  arrowValueDirection,
  inlineFraction,
  injectXDirection
} from './direction';

@Component({
  selector: 'x-dir-host',
  template: `<span></span>`
})
class DirHost {
  readonly direction: Signal<'ltr' | 'rtl'> = injectXDirection();
}

@Component({
  selector: 'x-dir-wrapper',
  imports: [Dir, DirHost],
  template: `<div dir="rtl"><x-dir-host /></div>`
})
class RtlWrapper {}

describe('injectXDirection', () => {
  it('reports ltr by default', () => {
    const fixture = TestBed.createComponent(DirHost);
    fixture.detectChanges();

    expect(fixture.componentInstance.direction()).toBe('ltr');
  });

  it('follows the nearest [dir] ancestor', () => {
    const fixture = TestBed.createComponent(RtlWrapper);
    fixture.detectChanges();

    const host = fixture.debugElement.query(node => node.name === 'x-dir-host').componentInstance as DirHost;
    expect(host.direction()).toBe('rtl');
  });
});

describe('arrowDirection', () => {
  it('maps the horizontal arrows by reading order', () => {
    expect(arrowDirection('ArrowRight', 'ltr')).toBe('next');
    expect(arrowDirection('ArrowLeft', 'ltr')).toBe('previous');

    // Mirrored in RTL: ArrowRight walks back towards the start of the line.
    expect(arrowDirection('ArrowRight', 'rtl')).toBe('previous');
    expect(arrowDirection('ArrowLeft', 'rtl')).toBe('next');
  });

  it('leaves the vertical arrows alone', () => {
    expect(arrowDirection('ArrowDown', 'rtl')).toBe('next');
    expect(arrowDirection('ArrowUp', 'rtl')).toBe('previous');
  });

  it('ignores anything that is not an arrow', () => {
    expect(arrowDirection('Enter', 'ltr')).toBeNull();
    expect(arrowDirection('Home', 'rtl')).toBeNull();
  });
});

describe('arrowDirectionOnAxis', () => {
  it('only answers for arrows on its own axis', () => {
    expect(arrowDirectionOnAxis('ArrowRight', 'ltr', 'horizontal')).toBe('next');
    expect(arrowDirectionOnAxis('ArrowDown', 'ltr', 'horizontal')).toBeNull();

    expect(arrowDirectionOnAxis('ArrowDown', 'ltr', 'vertical')).toBe('next');
    expect(arrowDirectionOnAxis('ArrowRight', 'ltr', 'vertical')).toBeNull();
  });

  it('still mirrors the horizontal axis in RTL', () => {
    expect(arrowDirectionOnAxis('ArrowRight', 'rtl', 'horizontal')).toBe('previous');
  });
});

describe('arrowValueDirection', () => {
  it('treats ArrowUp as an increase, unlike a list', () => {
    // The list mapping calls ArrowUp "previous"; a slider has to go the other way.
    expect(arrowDirection('ArrowUp', 'ltr')).toBe('previous');
    expect(arrowValueDirection('ArrowUp', 'ltr')).toBe('increase');
    expect(arrowValueDirection('ArrowDown', 'ltr')).toBe('decrease');
  });

  it('mirrors the horizontal pair in RTL', () => {
    expect(arrowValueDirection('ArrowRight', 'ltr')).toBe('increase');
    expect(arrowValueDirection('ArrowRight', 'rtl')).toBe('decrease');
    expect(arrowValueDirection('ArrowLeft', 'rtl')).toBe('increase');
  });

  it('leaves the vertical pair unmirrored', () => {
    expect(arrowValueDirection('ArrowUp', 'rtl')).toBe('increase');
    expect(arrowValueDirection('ArrowDown', 'rtl')).toBe('decrease');
  });

  it('ignores anything that is not an arrow', () => {
    expect(arrowValueDirection('PageUp', 'ltr')).toBeNull();
  });
});

describe('inlineFraction', () => {
  const rect = { left: 100, width: 200 };

  it('measures from the left edge in LTR', () => {
    expect(inlineFraction(100, rect, 'ltr')).toBe(0);
    expect(inlineFraction(150, rect, 'ltr')).toBe(0.25);
    expect(inlineFraction(300, rect, 'ltr')).toBe(1);
  });

  it('measures from the right edge in RTL', () => {
    expect(inlineFraction(300, rect, 'rtl')).toBe(0);
    expect(inlineFraction(150, rect, 'rtl')).toBe(0.75);
    expect(inlineFraction(100, rect, 'rtl')).toBe(1);
  });

  it('returns 0 for a zero-width track rather than dividing by it', () => {
    expect(inlineFraction(50, { left: 0, width: 0 }, 'ltr')).toBe(0);
  });
});
