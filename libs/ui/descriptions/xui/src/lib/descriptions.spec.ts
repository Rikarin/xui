import { expectClasses, render } from '@xui/testing';
import { XuiDescriptionsImports } from '../index';

const IMPORTS = [XuiDescriptionsImports];
const cells = () => [...document.querySelectorAll('xui-descriptions > div:last-child > div')] as HTMLElement[];

describe('XuiDescriptions', () => {
  it('renders each item label and projected value', () => {
    const { detect } = render(
      `<xui-descriptions>
         <xui-descriptions-item label="Name">Ada</xui-descriptions-item>
         <xui-descriptions-item label="Role">Engineer</xui-descriptions-item>
       </xui-descriptions>`,
      { imports: IMPORTS }
    );
    detect();

    const text = cells().map(c => c.textContent?.replace(/\s+/g, ' ').trim());
    expect(text[0]).toContain('Name');
    expect(text[0]).toContain('Ada');
    expect(text[1]).toContain('Role');
    expect(text[1]).toContain('Engineer');
  });

  it('sets the grid column count', () => {
    const { detect } = render(
      `<xui-descriptions [column]="2"><xui-descriptions-item label="A">1</xui-descriptions-item></xui-descriptions>`,
      { imports: IMPORTS }
    );
    detect();

    const grid = document.querySelector('xui-descriptions > div') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
  });

  it('spans an item across columns, clamped to the column count', () => {
    const { detect } = render(
      `<xui-descriptions [column]="3">
         <xui-descriptions-item label="Wide" [span]="5">x</xui-descriptions-item>
       </xui-descriptions>`,
      { imports: IMPORTS }
    );
    detect();

    // span 5 clamps to the 3-column max.
    expect(cells()[0].style.gridColumn).toBe('span 3');
  });

  it('applies the bordered variant', () => {
    const { detect } = render(
      `<xui-descriptions bordered><xui-descriptions-item label="A">1</xui-descriptions-item></xui-descriptions>`,
      { imports: IMPORTS }
    );
    detect();

    expectClasses(document.querySelector('xui-descriptions') as HTMLElement, 'border', 'rounded-lg');
  });

  it('pads the title into the box when bordered, and leaves it above the grid when not', () => {
    const { detect, setProps } = render(
      `<xui-descriptions title="Order #1024" [bordered]="props().bordered">
         <xui-descriptions-item label="A">1</xui-descriptions-item>
       </xui-descriptions>`,
      { imports: IMPORTS, props: { bordered: true } }
    );
    detect();

    const title = () => document.querySelector('xui-descriptions > div') as HTMLElement;
    expect(title().textContent?.trim()).toBe('Order #1024');
    expectClasses(title(), 'px-4', 'py-2.5', 'border-b');

    setProps({ bordered: false });
    detect();

    expect(title().classList).toContain('mb-2');
    expect(title().classList).not.toContain('px-4');
  });

  it('stacks label over value when vertical', () => {
    const { detect } = render(
      `<xui-descriptions orientation="vertical"><xui-descriptions-item label="A">1</xui-descriptions-item></xui-descriptions>`,
      { imports: IMPORTS }
    );
    detect();

    expectClasses(cells()[0], 'flex-col');
  });
});
