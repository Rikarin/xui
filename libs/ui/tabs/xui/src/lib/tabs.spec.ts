import { expectAttributes, expectClasses, provideDirection, render } from '@xui/testing';
import { XuiTabsImports } from '../index';
import { provideXuiTabsConfig } from './tabs.token';

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

  it('takes its defaults from the injected config', () => {
    const { detect } = render(TEMPLATE, {
      imports: IMPORTS,
      props: { selected: 'a' },
      providers: [provideXuiTabsConfig({ large: true, animate: true })]
    });
    detect();

    // `large` grows the tab buttons; `animate` renders the sliding indicator bar.
    expectClasses(tabButtons()[0], 'px-4', 'text-base');
    expect(document.querySelector('[role="tablist"] > [aria-hidden="true"]')).toBeTruthy();
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

  describe('RTL', () => {
    const rtl = (props: Record<string, unknown>) =>
      render(TEMPLATE, { imports: IMPORTS, props, providers: [provideDirection('rtl')] });

    it('mirrors the horizontal arrows', () => {
      const { detect, press } = rtl({ selected: 'b' });
      detect();

      // Alpha sits to the *right* of Beta in RTL, so ArrowRight goes back to it.
      press(tabButtons()[1], 'ArrowRight');
      expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });

      press(tabButtons()[0], 'ArrowLeft');
      expectAttributes(tabButtons()[1], { 'aria-selected': 'true' });
    });

    it('leaves Home and End alone', () => {
      const { detect, press } = rtl({ selected: 'b' });
      detect();

      press(tabButtons()[1], 'Home');
      expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });
    });
  });

  describe('a tab list built by a control-flow block', () => {
    const DYNAMIC = `
      <xui-tabs [(selectedTabId)]="props().selected">
        @for (tab of props().tabs; track tab.id) {
          <xui-tab [id]="tab.id" [title]="tab.title">Panel {{ tab.title }}</xui-tab>
        }
      </xui-tabs>
    `;

    const TABS = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' }
    ];

    // `@for` applies its bindings after `xui-tabs` first sees the tabs, so an id
    // read in that window is not yet the bound one. Selection has to converge.
    it('selects the first tab once the bound ids arrive', () => {
      const { detect } = render(DYNAMIC, { imports: IMPORTS, props: { selected: null, tabs: TABS } });
      detect();

      expect(tabButtons().map(b => b.textContent?.trim())).toEqual(['Alpha', 'Beta']);
      expectAttributes(tabButtons()[0], { 'aria-selected': 'true' });
      expect(visiblePanel()?.textContent?.trim()).toBe('Panel Alpha');
    });

    it('honours a selection given up front', () => {
      const { detect } = render(DYNAMIC, { imports: IMPORTS, props: { selected: 'b', tabs: TABS } });
      detect();

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
