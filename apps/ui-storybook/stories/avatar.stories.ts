import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiAvatar, XuiAvatarImports } from '@xui/avatar';

/**
 * A compact user/entity representation — image, text initials, or a projected
 * icon, with an automatic fallback when the image fails. Group several with
 * `<xui-avatar-group>` to overlap them, optionally collapsing past `max`.
 */
const meta: Meta<XuiAvatar> = {
  title: 'Data display/Avatar',
  component: XuiAvatar,
  decorators: [moduleMetadata({ imports: [XuiAvatarImports] })]
};

export default meta;
type Story = StoryObj<XuiAvatar>;

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <xui-avatar src="https://i.pravatar.cc/80?img=12" alt="Photo" />
        <xui-avatar text="JD" />
        <xui-avatar text="AB" shape="square" />
        <xui-avatar text="XL" size="xl" class="bg-primary text-primary-foreground" />
      </div>
    `
  })
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <xui-avatar text="S" size="sm" />
        <xui-avatar text="M" size="md" />
        <xui-avatar text="L" size="lg" />
        <xui-avatar text="XL" size="xl" />
      </div>
    `
  })
};

export const Fallback: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <xui-avatar src="/does-not-exist.png" text="JD" />
        <span class="text-foreground-muted text-sm">← broken image falls back to initials</span>
      </div>
    `
  })
};

export const Group: Story = {
  render: () => ({
    template: `
      <xui-avatar-group [max]="3">
        <xui-avatar src="https://i.pravatar.cc/80?img=1" />
        <xui-avatar src="https://i.pravatar.cc/80?img=2" />
        <xui-avatar text="CD" class="bg-info text-info-foreground" />
        <xui-avatar text="EF" />
        <xui-avatar text="GH" />
      </xui-avatar-group>
    `
  })
};
