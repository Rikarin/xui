import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTabs, XuiTabsImports } from '@xui/tabs';

/**
 * Tabbed navigation. Arrow keys move between tabs (roving tabindex), Home/End
 * jump to the ends, and disabled tabs are skipped. `[(selectedTabId)]` two-way
 * binding; `animate` slides an indicator, `orientation`/`fill`/`large` adjust layout.
 */
const meta: Meta<XuiTabs> = {
  title: 'Navigation/Tabs',
  component: XuiTabs,
  decorators: [moduleMetadata({ imports: [XuiTabsImports] })]
};

export default meta;
type Story = StoryObj<XuiTabs>;

export const Default: Story = {
  render: () => ({
    props: { selected: 'overview' },
    template: `
      <div class="w-[32rem]">
        <xui-tabs [(selectedTabId)]="selected">
          <xui-tab id="overview" title="Overview">
            <p class="text-sm">A high-level summary of the project and its status.</p>
          </xui-tab>
          <xui-tab id="activity" title="Activity">
            <p class="text-sm">Recent activity across the team.</p>
          </xui-tab>
          <xui-tab id="settings" title="Settings">
            <p class="text-sm">Configuration and preferences.</p>
          </xui-tab>
          <xui-tab id="archived" title="Archived" [disabled]="true">
            <p class="text-sm">Archived items.</p>
          </xui-tab>
        </xui-tabs>
      </div>
    `
  })
};

/** An animated indicator slides under the active tab. */
export const Animated: Story = {
  render: () => ({
    template: `
      <div class="w-[32rem]">
        <xui-tabs animate selectedTabId="two">
          <xui-tab id="one" title="First">First panel</xui-tab>
          <xui-tab id="two" title="Second">Second panel</xui-tab>
          <xui-tab id="three" title="Third">Third panel</xui-tab>
        </xui-tabs>
      </div>
    `
  })
};

/** Stretched to fill the width. */
export const Fill: Story = {
  render: () => ({
    template: `
      <div class="w-[32rem]">
        <xui-tabs fill animate selectedTabId="a">
          <xui-tab id="a" title="Files">Files panel</xui-tab>
          <xui-tab id="b" title="Commits">Commits panel</xui-tab>
          <xui-tab id="c" title="Branches">Branches panel</xui-tab>
        </xui-tabs>
      </div>
    `
  })
};

/** A vertical tab strip. */
export const Vertical: Story = {
  render: () => ({
    template: `
      <div class="w-[32rem]">
        <xui-tabs orientation="vertical" animate selectedTabId="profile">
          <xui-tab id="profile" title="Profile">Profile settings</xui-tab>
          <xui-tab id="account" title="Account">Account settings</xui-tab>
          <xui-tab id="security" title="Security">Security settings</xui-tab>
        </xui-tabs>
      </div>
    `
  })
};
