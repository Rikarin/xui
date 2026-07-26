import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiButton } from './button';
import { provideXuiButtonConfig } from './button.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiButton], providers });

const instance = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.children[0].injector.get(XuiButton);

describe('XuiButton', () => {
  it('applies the base classes to the host button', () => {
    const { query } = setup('<button xuiButton>Save</button>');

    expect(query('button').textContent).toBe('Save');
    expectClasses(query('button'), 'inline-flex', 'rounded-lg', 'cursor-pointer');
  });

  it('defaults to a filled primary button at the default size', () => {
    const { query } = setup('<button xuiButton></button>');

    expectClasses(
      query('button'),
      'bg-primary',
      'text-primary-foreground',
      'h-(--control-height-md)',
      'px-(--control-padding-md)'
    );
  });

  it('applies the colour through the variant/colour compound', () => {
    const { query } = setup('<button xuiButton color="error"></button>');

    expectClasses(query('button'), 'bg-error', 'text-error-foreground', 'hover:bg-error-darker');
    expectNoClasses(query('button'), 'bg-primary');
  });

  it('swaps the fill for a border on the outline variant', () => {
    const { query } = setup('<button xuiButton variant="outline" color="success"></button>');

    expectClasses(query('button'), 'border-success', 'hover:bg-success', 'text-foreground');
    expectNoClasses(query('button'), 'bg-success');
  });

  it('applies the size variant', () => {
    const { query } = setup('<button xuiButton size="sm"></button>');

    expectClasses(query('button'), 'h-(--control-height-sm)', 'px-(--control-padding-sm)');
    expectNoClasses(query('button'), 'h-(--control-height-md)');
  });

  it('neutralises pointer events while disabled', () => {
    const { query } = setup('<button xuiButton disabled></button>');

    expectClasses(query('button'), 'disabled:pointer-events-none', 'disabled:saturate-30');
    expect(query<HTMLButtonElement>('button').disabled).toBe(true);
  });

  it('takes its defaults from the injected config', () => {
    const { fixture, query } = setup('<button xuiButton></button>', [
      provideXuiButtonConfig({ color: 'success', size: 'lg' })
    ]);

    expect(instance(fixture).color()).toBe('success');
    expectClasses(query('button'), 'bg-success', 'h-(--control-height-lg)');
  });

  it('lets an explicit input win over the configured default', () => {
    const { fixture } = setup('<button xuiButton color="error"></button>', [
      provideXuiButtonConfig({ color: 'success' })
    ]);

    expect(instance(fixture).color()).toBe('error');
  });

  it('merges the class input over the variant classes', () => {
    const { query } = setup('<button xuiButton class="w-full"></button>');

    expectClasses(query('button'), 'w-full', 'bg-primary');
  });

  it('setClass adds classes without dropping the variant classes', () => {
    const { fixture, query } = setup('<button xuiButton></button>');

    instance(fixture).setClass('ring-2');
    fixture.detectChanges();

    expectClasses(query('button'), 'ring-2', 'bg-primary');
  });

  describe('layout and content extras', () => {
    it('stretches to fill when asked', () => {
      const { query } = setup('<button xuiButton fill></button>');

      expectClasses(query('button'), 'w-full', 'min-w-0');
    });

    it('aligns its contents', () => {
      const { query } = setup('<button xuiButton alignText="left"></button>');

      expectClasses(query('button'), 'justify-start', 'text-start');
      expectNoClasses(query('button'), 'justify-center');
    });

    it('marks itself pressed when active', () => {
      const { query } = setup('<button xuiButton active></button>');

      expectClasses(query('button'), 'shadow-elevation-0');
      expect(query('button').getAttribute('aria-pressed')).toBe('true');
    });

    it('shows a spinner and hides the label while loading, keeping width', () => {
      const { query } = setup('<button xuiButton loading>Save</button>');

      expectClasses(query('button'), 'text-transparent', 'pointer-events-none', 'before:animate-spin');
      expect(query('button').getAttribute('aria-busy')).toBe('true');
      // The label text is still present (laid out, just transparent) so the width holds.
      expect(query('button').textContent).toBe('Save');
    });

    it('works as an anchor button', () => {
      const { query } = setup('<a xuiButton href="#go">Go</a>');

      expectClasses(query('a'), 'inline-flex', 'bg-primary');
    });
  });
});
