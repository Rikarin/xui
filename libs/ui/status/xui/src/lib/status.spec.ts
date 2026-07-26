import { expectClasses, render } from '@xui/testing';
import { XuiStatus } from './status';

const setup = (template: string) => render(template, { imports: [XuiStatus] });

describe('XuiStatus', () => {
  it('applies the base classes', () => {
    const { query } = setup('<xui-status variant="online" />');

    expectClasses(query('xui-status'), 'inline-flex', 'aspect-square');
  });

  it.each([
    ['online', 'bg-success'],
    ['idle', 'bg-warning'],
    ['dnd', 'bg-error'],
    ['offline', 'bg-muted-foreground']
  ])('colours the %s variant with %s', (variant, expected) => {
    const { query } = setup(`<xui-status variant="${variant}" />`);

    expectClasses(query('xui-status'), expected);
  });

  it('defaults to the md size', () => {
    const { query } = setup('<xui-status variant="online" />');

    expectClasses(query('xui-status'), 'w-4');
  });

  it('applies the size variant', () => {
    const { query } = setup('<xui-status variant="online" size="lg" />');

    expectClasses(query('xui-status'), 'w-6');
  });

  it('clips the non-online variants to their distinct shapes', () => {
    const { query: online } = setup('<xui-status variant="online" />');
    expect(online('xui-status').style.clipPath).toBe('');
    expect(online('xui-status').querySelector('clipPath')).toBeNull();

    const { query: dnd } = setup('<xui-status variant="dnd" />');
    const clip = dnd('xui-status').querySelector('clipPath') as SVGClipPathElement;
    expect(dnd('xui-status').style.clipPath).toBe(`url(#${clip.id})`);
  });

  it('gives each instance its own clip-path id', () => {
    const { queryAll } = setup('<xui-status variant="dnd" /><xui-status variant="dnd" />');
    const [first, second] = queryAll('clipPath');

    expect(first.id).not.toBe(second.id);
  });
});
