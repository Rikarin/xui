import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiTag } from './tag';
import { provideXuiTagConfig } from './tag.token';

const setup = (template: string, providers: unknown[] = []) => render(template, { imports: [XuiTag], providers });

const instance = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.query(n => n.name === 'xui-tag').componentInstance as XuiTag;

describe('XuiTag', () => {
  it('renders its content as a neutral solid tag by default', () => {
    const { query } = setup('<xui-tag>Draft</xui-tag>');

    expect(query('xui-tag').textContent?.trim()).toBe('Draft');
    expectClasses(query('xui-tag'), 'inline-flex', 'bg-surface-inset', 'rounded');
  });

  it('applies the colour as a solid fill', () => {
    const { query } = setup('<xui-tag color="success">Live</xui-tag>');

    expectClasses(query('xui-tag'), 'bg-success', 'text-success-foreground');
  });

  it('uses a subtle fill when minimal', () => {
    const { query } = setup('<xui-tag color="error" minimal>Error</xui-tag>');

    expectClasses(query('xui-tag'), 'bg-error/15', 'text-error');
    expectNoClasses(query('xui-tag'), 'bg-error');
  });

  it('rounds fully and grows when asked', () => {
    const { query } = setup('<xui-tag round large>Big</xui-tag>');

    expectClasses(query('xui-tag'), 'rounded-full', 'text-sm', 'px-3');
  });

  it('shows a pointer cursor when interactive', () => {
    const { query } = setup('<xui-tag interactive>Click</xui-tag>');

    expectClasses(query('xui-tag'), 'cursor-pointer');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<xui-tag>Draft</xui-tag>', [
      provideXuiTagConfig({ color: 'primary', round: true, large: true })
    ]);

    expectClasses(query('xui-tag'), 'bg-primary', 'rounded-full', 'text-sm');
  });

  it('has no remove button unless removable', () => {
    const { query } = setup('<xui-tag>Fixed</xui-tag>');

    expect(query('xui-tag').querySelector('button')).toBeNull();
  });

  it('emits removed and stops propagation when the ✕ is clicked', () => {
    let removed = 0;
    let tagClicks = 0;
    const { fixture, query } = setup('<xui-tag removable (click)="0">Closable</xui-tag>');
    instance(fixture).removed.subscribe(() => removed++);
    query('xui-tag').addEventListener('click', () => tagClicks++);
    fixture.detectChanges();

    query('button[aria-label="Remove"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(removed).toBe(1);
    // stopPropagation keeps the remove click from bubbling to the tag itself.
    expect(tagClicks).toBe(0);
  });

  it('renders a leading icon when given', () => {
    const { query } = setup('<xui-tag icon="matStar">Starred</xui-tag>');

    expect(query('xui-tag').querySelector('ng-icon')).toBeTruthy();
  });
});
