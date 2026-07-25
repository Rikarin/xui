import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectClasses, render } from '@xui/testing';
import { XuiHtmlSelectImports } from '../index';

const IMPORTS = [XuiHtmlSelectImports, ReactiveFormsModule];

const select = () => document.querySelector('xui-html-select select') as HTMLSelectElement;
const options = () => [...select().options];

const choose = (value: string, detect: () => void) => {
  select().value = value;
  select().dispatchEvent(new Event('change', { bubbles: true }));
  detect();
};

describe('XuiHtmlSelect', () => {
  it('renders a real select framed with a chevron', () => {
    const { detect, host } = render('<xui-html-select [options]="props().options" />', {
      imports: IMPORTS,
      props: { options: [{ value: 'a', label: 'Alpha' }] }
    });
    detect();

    expect(select().tagName).toBe('SELECT');
    expect(host.querySelector('ng-icon')).toBeTruthy();
  });

  it('renders data-driven options', () => {
    const { detect } = render('<xui-html-select [options]="props().options" />', {
      imports: IMPORTS,
      props: {
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta', disabled: true }
        ]
      }
    });
    detect();

    expect(options().map(o => o.textContent?.trim())).toEqual(['Alpha', 'Beta']);
    expect(options()[1].disabled).toBe(true);
  });

  it('shows an unselectable placeholder when nothing is chosen', () => {
    const { detect } = render('<xui-html-select placeholder="Pick one" [options]="props().options" />', {
      imports: IMPORTS,
      props: { options: [{ value: 'a', label: 'Alpha' }] }
    });
    detect();

    expect(options()[0].textContent?.trim()).toBe('Pick one');
    expect(options()[0].disabled).toBe(true);
  });

  it('projects option elements as an alternative to the data API', () => {
    const { detect } = render('<xui-html-select><option value="x">Projected</option></xui-html-select>', {
      imports: IMPORTS
    });
    detect();

    expect(options().map(o => o.textContent?.trim())).toContain('Projected');
  });

  it('applies the fill and size variants to the wrapper', () => {
    const { detect } = render('<xui-html-select fill size="sm" />', { imports: IMPORTS });
    detect();

    expectClasses(document.querySelector('xui-html-select') as HTMLElement, 'w-full', 'h-(--control-height-sm)');
  });

  describe('as a form control', () => {
    it('writes the control value onto the select', () => {
      const control = new FormControl('b');
      const { detect } = render('<xui-html-select [options]="props().options" [formControl]="props().control" />', {
        imports: IMPORTS,
        props: {
          control,
          options: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' }
          ]
        }
      });
      detect();

      expect(options()[1].selected).toBe(true);
    });

    it('recovers the original typed value on change, not just the DOM string', () => {
      const control = new FormControl<number | null>(null);
      const { detect } = render('<xui-html-select [options]="props().options" [formControl]="props().control" />', {
        imports: IMPORTS,
        props: {
          control,
          options: [
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' }
          ]
        }
      });
      detect();

      choose('2', detect);

      // The DOM only carries "2"; the control should get the number 2.
      expect(control.value).toBe(2);
    });

    it('honours the disabled state', () => {
      const control = new FormControl('a');
      const { detect } = render('<xui-html-select [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();
      control.disable();
      detect();

      expect(select().disabled).toBe(true);
    });
  });
});
