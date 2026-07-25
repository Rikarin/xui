import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiNavigationMenu, XuiNavigationMenuImports } from '@xui/navigation-menu';

/**
 * A horizontal nav where items open a rich dropdown "mega menu". Panels open on
 * hover or focus and share one viewport under the bar; items with an `href` and
 * no template are plain links.
 */
const meta: Meta<XuiNavigationMenu> = {
  title: 'Navigation/Navigation menu',
  component: XuiNavigationMenu,
  decorators: [moduleMetadata({ imports: [XuiNavigationMenuImports] })]
};

export default meta;
type Story = StoryObj<XuiNavigationMenu>;

export const Basic: Story = {
  render: () => ({
    template: `
      <div class="pb-64">
        <xui-navigation-menu>
          <xui-navigation-menu-item value="products" trigger="Products">
            <ng-template>
              <div class="grid w-[30rem] grid-cols-2 gap-2">
                @for (p of ['Analytics','Engagement','Security','Automation']; track p) {
                  <a class="hover:bg-surface-inset block rounded-md p-3">
                    <div class="text-foreground text-sm font-medium">{{ p }}</div>
                    <div class="text-foreground-muted mt-0.5 text-xs">Everything you need for {{ p.toLowerCase() }}.</div>
                  </a>
                }
              </div>
            </ng-template>
          </xui-navigation-menu-item>

          <xui-navigation-menu-item value="resources" trigger="Resources">
            <ng-template>
              <div class="flex w-56 flex-col">
                @for (r of ['Documentation','Guides','API reference','Changelog']; track r) {
                  <a class="hover:bg-surface-inset text-foreground rounded-md px-3 py-2 text-sm">{{ r }}</a>
                }
              </div>
            </ng-template>
          </xui-navigation-menu-item>

          <xui-navigation-menu-item value="pricing" trigger="Pricing" href="#pricing" />
        </xui-navigation-menu>
      </div>
    `
  })
};
