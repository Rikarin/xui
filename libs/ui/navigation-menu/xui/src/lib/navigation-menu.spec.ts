import { render } from '@xui/testing';
import { XuiNavigationMenu } from './navigation-menu';
import { XuiNavigationMenuItem } from './navigation-menu-item';

const setup = () => {
  const result = render(
    `<xui-navigation-menu>
       <xui-navigation-menu-item value="products" trigger="Products">
         <ng-template><div class="panel-body">Product links</div></ng-template>
       </xui-navigation-menu-item>
       <xui-navigation-menu-item value="pricing" trigger="Pricing" href="/pricing" />
     </xui-navigation-menu>`,
    { imports: [XuiNavigationMenu, XuiNavigationMenuItem] }
  );
  const triggers = () => [...document.querySelectorAll('xui-navigation-menu button')] as HTMLButtonElement[];
  const link = () => document.querySelector('xui-navigation-menu a') as HTMLAnchorElement | null;
  const panel = () => document.querySelector('.panel-body') as HTMLElement | null;
  return { ...result, triggers, link, panel };
};

const hover = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

describe('XuiNavigationMenu', () => {
  it('renders a trigger button for a panel item and a link for an href item', () => {
    const { detect, triggers, link } = setup();
    detect();
    expect(triggers()).toHaveLength(1);
    expect(triggers()[0].textContent?.trim()).toContain('Products');
    expect(link()?.getAttribute('href')).toBe('/pricing');
  });

  it('opens the panel on hover and shows its content', () => {
    const { detect, triggers, panel } = setup();
    detect();
    expect(panel()).toBeNull();

    hover(triggers()[0]);
    detect();
    expect(panel()?.textContent).toBe('Product links');
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles the panel closed on a second click', () => {
    const { detect, triggers, panel } = setup();
    detect();
    triggers()[0].click();
    detect();
    expect(panel()).not.toBeNull();

    triggers()[0].click();
    detect();
    expect(panel()).toBeNull();
  });

  it('closes when the pointer leaves the nav', () => {
    const { detect, triggers, panel, query } = setup();
    detect();
    hover(triggers()[0]);
    detect();
    expect(panel()).not.toBeNull();

    query('nav')!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    detect();
    expect(panel()).toBeNull();
  });
});
