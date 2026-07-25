import { expectAttributes, render } from '@xui/testing';
import { XuiTabsImports } from '../index';

const IMPORTS = [XuiTabsImports];

const TEMPLATE = `
  <xui-tabs [(selectedTabId)]="props().selected" [renderActiveTabPanelOnly]="props().lazy ?? false">
    <xui-tab id="a" title="Alpha">Panel A</xui-tab>
    <xui-tab id="b" title="Beta">Panel B</xui-tab>
    <xui-tab id="c" title="Gamma" [disabled]="true">Panel C</xui-tab>
  </xui-tabs>
`;

const tabButtons = () => [...document.querySelectorAll('[role="tab"]')] as HTMLButtonElement[];
const panels = () => [...document.querySelectorAll('[role="tabpanel"]')] as HTMLElement[];
const visiblePanel = () => panels().find(p => !p.hidden);

describe('XuiTabs', () => {
  it('renders a tablist with a tab per xui-tab', () => {
    const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
    detect();

    expect(tabButtons().map(b => b.textContent?.trim())).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(document.querySelector('[role="tablist"]')).toBeTruthy();
  });

  it('selects the first enabled tab by default', () => {
    const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: null } });
    detect();

    expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });
    expect(visiblePanel()?.textContent?.trim()).toBe('Panel A');
  });

  it('shows only the selected tab panel', () => {
    const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'b' } });
    detect();

    expect(visiblePanel()?.textContent?.trim()).toBe('Panel B');
    expectAttributes(tabButtons()[1], { 'aria-selected': 'true' });
  });

  it('wires aria-controls / aria-labelledby between tab and panel', () => {
    const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
    detect();

    const controls = tabButtons()[0].getAttribute('aria-controls');
    expect(visiblePanel()?.id).toBe(controls);
    expect(visiblePanel()?.getAttribute('aria-labelledby')).toBe(tabButtons()[0].id);
  });

  it('changes selection on click', () => {
    const { detect, click } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
    detect();

    click(tabButtons()[1]);

    expect(visiblePanel()?.textContent?.trim()).toBe('Panel B');
  });

  it('does not select a disabled tab', () => {
    const { detect, click } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
    detect();

    click(tabButtons()[2]);

    expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });
  });

  it('uses roving tabindex — only the selected tab is tabbable', () => {
    const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'b' } });
    detect();

    expect(tabButtons().map(b => b.tabIndex)).toEqual([-1, 0, -1]);
  });

  describe('keyboard', () => {
    it('moves to the next enabled tab with ArrowRight, skipping disabled', () => {
      const { detect, press } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
      detect();

      press(tabButtons()[0], 'ArrowRight');
      expectAttributes(tabButtons()[1], { 'aria-selected': 'true' });

      // From Beta, the next enabled tab wraps past disabled Gamma back to Alpha.
      press(tabButtons()[1], 'ArrowRight');
      expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });
    });

    it('jumps to the last enabled tab with End', () => {
      const { detect, press } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
      detect();

      press(tabButtons()[0], 'End');

      // Gamma is disabled, so End lands on Beta.
      expectAttributes(tabButtons()[1], { 'aria-selected': 'true' });
    });
  });

  describe('renderActiveTabPanelOnly', () => {
    it('keeps every panel mounted by default', () => {
      const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a' } });
      detect();

      expect(panels().length).toBe(3);
    });

    it('mounts only the active panel when set', () => {
      const { detect } = render(TEMPLATE, { imports: IMPORTS, props: { selected: 'a', lazy: true } });
      detect();

      expect(panels().length).toBe(1);
      expect(panels()[0].textContent?.trim()).toBe('Panel A');
    });
  });
});
