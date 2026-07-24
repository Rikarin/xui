import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiSliderImports } from '../index';
import { XuiSlider } from './slider';

const IMPORTS = [XuiSliderImports, ReactiveFormsModule];

const handle = () => document.querySelector('[role="slider"]') as HTMLElement;

const instance = (fixture: ReturnType<typeof render>['fixture']) =>
  fixture.debugElement.query(node => node.name === 'xui-slider').componentInstance as XuiSlider;

describe('XuiSlider', () => {
  it('exposes the ARIA slider contract', () => {
    const { detect } = render('<xui-slider min="0" max="10" value="4" />', { imports: IMPORTS });
    detect();

    expectAttributes(handle(), {
      role: 'slider',
      'aria-valuemin': '0',
      'aria-valuemax': '10',
      'aria-valuenow': '4',
      'aria-orientation': 'horizontal'
    });
  });

  it('snaps the initial value to the step grid', () => {
    const { fixture, detect } = render('<xui-slider min="0" max="10" stepSize="2" value="5" />', { imports: IMPORTS });
    detect();

    // 5 snaps to the nearest multiple of 2 from min → 6.
    expect(instance(fixture).value()).toBe(6);
  });

  it('clamps a value beyond the bounds', () => {
    const { fixture, detect } = render('<xui-slider min="0" max="10" value="99" />', { imports: IMPORTS });
    detect();

    expect(instance(fixture).value()).toBe(10);
  });

  describe('keyboard', () => {
    it('steps up and down with the arrow keys', () => {
      const { fixture, press, detect } = render('<xui-slider min="0" max="10" value="5" />', { imports: IMPORTS });
      detect();

      press(handle(), 'ArrowRight');
      expect(instance(fixture).value()).toBe(6);

      press(handle(), 'ArrowLeft');
      press(handle(), 'ArrowLeft');
      expect(instance(fixture).value()).toBe(4);
    });

    it('jumps to the bounds with Home and End', () => {
      const { fixture, press, detect } = render('<xui-slider min="2" max="8" value="5" />', { imports: IMPORTS });
      detect();

      press(handle(), 'End');
      expect(instance(fixture).value()).toBe(8);

      press(handle(), 'Home');
      expect(instance(fixture).value()).toBe(2);
    });

    it('takes larger strides with PageUp/PageDown', () => {
      const { fixture, press, detect } = render(
        '<xui-slider min="0" max="100" stepSize="1" labelStepSize="10" value="50" />',
        { imports: IMPORTS }
      );
      detect();

      press(handle(), 'PageUp');
      expect(instance(fixture).value()).toBe(60);
    });

    it('does not move while disabled', () => {
      const { fixture, press, detect } = render('<xui-slider min="0" max="10" value="5" disabled />', {
        imports: IMPORTS
      });
      detect();

      press(handle(), 'ArrowRight');
      expect(instance(fixture).value()).toBe(5);
    });

    it('keeps fractional steps exact', () => {
      const { fixture, press, detect } = render('<xui-slider min="0" max="1" stepSize="0.1" value="0.2" />', {
        imports: IMPORTS
      });
      detect();

      press(handle(), 'ArrowRight');
      expect(instance(fixture).value()).toBe(0.3);
    });
  });

  describe('labels and ticks', () => {
    it('renders an axis label every labelStepSize', () => {
      const { detect } = render('<xui-slider min="0" max="10" labelStepSize="5" />', { imports: IMPORTS });
      detect();

      const labels = [...document.querySelectorAll('xui-slider .absolute.text-xs span')].map(s =>
        s.textContent?.trim()
      );
      expect(labels).toEqual(['0', '5', '10']);
    });

    it('formats labels through the renderer and reflects it in aria-valuetext', () => {
      const { detect } = render('<xui-slider min="0" max="10" value="5" [labelRenderer]="props().fmt" />', {
        imports: IMPORTS,
        props: { fmt: (v: number) => `${v}%` }
      });
      detect();

      expect(handle().getAttribute('aria-valuetext')).toBe('5%');
    });

    it('hides the axis when the renderer is false', () => {
      const { detect } = render('<xui-slider min="0" max="10" [labelRenderer]="props().r" />', {
        imports: IMPORTS,
        props: { r: false }
      });
      detect();

      expect(document.querySelector('xui-slider span')).toBeNull();
    });
  });

  describe('variants', () => {
    it('colours the fill and handle from the intent', () => {
      const { detect } = render('<xui-slider intent="success" value="5" />', { imports: IMPORTS });
      detect();

      expectClasses(document.querySelector('xui-slider [class*="bg-success"]') as HTMLElement, 'bg-success');
      expectClasses(handle(), 'border-success');
    });

    it('reports a vertical orientation', () => {
      const { detect } = render('<xui-slider vertical value="5" />', { imports: IMPORTS });
      detect();

      expectAttributes(handle(), { 'aria-orientation': 'vertical' });
    });
  });

  describe('as a form control', () => {
    it('writes the control value onto the slider', () => {
      const control = new FormControl(7);
      const { fixture, detect } = render('<xui-slider max="10" [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      expect(instance(fixture).value()).toBe(7);
      expectAttributes(handle(), { 'aria-valuenow': '7' });
    });

    it('notifies the control when moved by keyboard', () => {
      const control = new FormControl(5);
      const { press, detect } = render('<xui-slider max="10" [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      press(handle(), 'ArrowRight');

      expect(control.value).toBe(6);
    });

    it('honours the disabled state from the form', () => {
      const control = new FormControl(5);
      const { detect } = render('<xui-slider max="10" [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();
      control.disable();
      detect();

      expect(handle().tabIndex).toBe(-1);
      expectAttributes(handle(), { 'aria-disabled': 'true' });
    });
  });
});
