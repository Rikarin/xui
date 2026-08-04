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

/**
 * A tab list built from data by a `@for` block. The ids arrive as bindings
 * rather than static attributes, which is a different moment in the render —
 * so the strip is worth showing driven both ways.
 */
export const FromData: Story = {
  render: () => ({
    props: {
      selected: null,
      items: [
        { id: 'inbox', title: 'Inbox', body: 'Everything addressed to you.' },
        { id: 'drafts', title: 'Drafts', body: 'Started, not yet sent.' },
        { id: 'sent', title: 'Sent', body: 'On its way.' }
      ]
    },
    template: `
      <div class="w-[32rem]">
        <xui-tabs animate [(selectedTabId)]="selected">
          @for (item of items; track item.id) {
            <xui-tab [id]="item.id" [title]="item.title">
              <p class="text-sm">{{ item.body }}</p>
            </xui-tab>
          }
        </xui-tabs>
      </div>
    `
  })
};

/**
 * `id` is optional. Left off, each tab takes a generated one — enough for the
 * ARIA wiring and for an uncontrolled strip. Name the tabs you intend to select
 * from outside.
 */
export const WithoutIds: Story = {
  render: () => ({
    template: `
      <div class="w-[32rem]">
        <xui-tabs>
          <xui-tab title="Description">What the thing is.</xui-tab>
          <xui-tab title="Reviews">What people made of it.</xui-tab>
          <xui-tab title="Shipping">When it turns up.</xui-tab>
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
