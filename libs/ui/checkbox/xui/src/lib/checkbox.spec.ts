import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiCheckbox } from './checkbox';

const setup = (template: string, props?: Record<string, unknown>) =>
  render(template, { imports: [XuiCheckbox], props });

const instanceOf = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.children[0].componentInstance as XuiCheckbox;

describe('XuiCheckbox', () => {
  it('renders a checkbox-role button that starts unchecked', () => {
    const { query } = setup('<xui-checkbox />');

    expectAttributes(query('button'), { role: 'checkbox', 'aria-checked': 'false', 'data-state': 'unchecked' });
  });

  it('toggles on click and reflects the state on the button', () => {
    const { query, click } = setup('<xui-checkbox />');

    click('button');

    expectAttributes(query('button'), { 'aria-checked': 'true', 'data-state': 'checked' });
  });

  it('emits checkedChange when toggled', () => {
    const emitted: boolean[] = [];
    const { fixture, click } = setup('<xui-checkbox />');
    instanceOf(fixture).checked.subscribe(value => emitted.push(value));

    click('button');

    expect(emitted).toEqual([true]);
  });

  it('supports [(checked)] two-way binding', () => {
    const { query, click, fixture } = setup('<xui-checkbox [(checked)]="props().on" />', { on: false });

    click('button');

    expect((fixture.componentInstance.props() as { on: boolean }).on).toBe(true);
    expectAttributes(query('button'), { 'aria-checked': 'true' });
  });

  it('does not toggle while disabled', () => {
    const { query, click } = setup('<xui-checkbox disabled />');

    click('button');

    expectAttributes(query('button'), { 'aria-checked': 'false' });
    expect(query<HTMLButtonElement>('button').disabled).toBe(true);
  });

  it('takes the button out of the tab order while disabled', () => {
    const { query } = setup('<xui-checkbox disabled />');

    expect(query('button').tabIndex).toBe(-1);
  });

  it('applies the colour variant', () => {
    const { query } = setup('<xui-checkbox color="success" />');

    expectClasses(query('button'), '[&:not([data-state=unchecked])]:bg-success');
  });

  it('moves the aria attributes onto the button rather than the wrapper', () => {
    const { query } = setup('<xui-checkbox aria-label="Accept terms" />');

    expectAttributes(query('button'), { 'aria-label': 'Accept terms' });
    expectAttributes(query('xui-checkbox'), { 'aria-label': null });
  });

  describe('label and layout', () => {
    it('renders a plain-text label from the label input', () => {
      const { query } = setup('<xui-checkbox label="Remember me" />');

      expect(query('xui-checkbox > span').textContent).toContain('Remember me');
    });

    it('projects content beside the box', () => {
      const { query } = setup('<xui-checkbox>Accept <b>terms</b></xui-checkbox>');

      expect(query('xui-checkbox > span').textContent).toContain('Accept');
      expect(query('b')).toBeTruthy();
    });

    it('flips the row when the indicator aligns to the end', () => {
      const { query } = setup('<xui-checkbox alignIndicator="end" label="x" />');

      expectClasses(query('xui-checkbox > span'), 'flex-row-reverse');
    });

    it('lays out inline when asked', () => {
      const { query } = setup('<xui-checkbox inline label="x" />');

      expectClasses(query('xui-checkbox > span'), 'inline-flex');
    });

    it('grows the box and label when large', () => {
      const { query } = setup('<xui-checkbox large label="x" />');

      expectClasses(query('button'), 'p-0.5');
    });

    it('reflects disabled onto the wrapping label', () => {
      const { query } = setup('<xui-checkbox disabled label="x" />');

      expectClasses(query('xui-checkbox > span'), 'cursor-not-allowed');
    });

    it('toggles the box when the label text is clicked', () => {
      const { query, click } = setup('<xui-checkbox label="Toggle me" />');

      click('xui-checkbox > span > span');

      expectAttributes(query('button'), { 'aria-checked': 'true' });
    });

    it('names the box from the label input for assistive tech', () => {
      const { query } = setup('<xui-checkbox label="Accept terms" />');

      expectAttributes(query('button'), { 'aria-label': 'Accept terms' });
    });
  });

  describe('as a form control', () => {
    it('writeValue updates the rendered state', () => {
      const { fixture, query } = setup('<xui-checkbox />');

      instanceOf(fixture).writeValue(true);
      fixture.detectChanges();

      expectAttributes(query('button'), { 'aria-checked': 'true' });
    });

    it('writeValue does not emit checkedChange', () => {
      const emitted: boolean[] = [];
      const { fixture } = setup('<xui-checkbox />');
      instanceOf(fixture).checked.subscribe(value => emitted.push(value));

      instanceOf(fixture).writeValue(true);
      fixture.detectChanges();

      expect(emitted).toEqual([]);
      expect(instanceOf(fixture).checked()).toBe(true);
    });

    it('notifies the registered onChange when toggled', () => {
      const changes: boolean[] = [];
      const { fixture, click } = setup('<xui-checkbox />');
      instanceOf(fixture).registerOnChange(value => changes.push(value));

      click('button');

      expect(changes).toEqual([true]);
    });

    it('setDisabledState disables the control', () => {
      const { fixture, query } = setup('<xui-checkbox />');

      instanceOf(fixture).setDisabledState(true);
      fixture.detectChanges();

      expect(query<HTMLButtonElement>('button').disabled).toBe(true);
    });
  });
});
