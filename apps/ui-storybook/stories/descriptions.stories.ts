import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDescriptions, XuiDescriptionsImports } from '@xui/descriptions';

/**
 * A key/value description list on a responsive grid — set `column`, switch
 * `layout` between inline and stacked, and toggle the `bordered` table variant.
 */
const meta: Meta<XuiDescriptions> = {
  title: 'Data display/Descriptions',
  component: XuiDescriptions,
  decorators: [moduleMetadata({ imports: [XuiDescriptionsImports] })]
};

export default meta;
type Story = StoryObj<XuiDescriptions>;

export const Basic: Story = {
  render: () => ({
    template: `
      <xui-descriptions title="User" [column]="2" class="w-[560px]">
        <xui-descriptions-item label="Name">Ada Lovelace</xui-descriptions-item>
        <xui-descriptions-item label="Role">Engineer</xui-descriptions-item>
        <xui-descriptions-item label="Email">ada@example.com</xui-descriptions-item>
        <xui-descriptions-item label="Location">London</xui-descriptions-item>
        <xui-descriptions-item label="Bio" [span]="2">First computer programmer; worked on the Analytical Engine.</xui-descriptions-item>
      </xui-descriptions>
    `
  })
};

export const Bordered: Story = {
  render: () => ({
    template: `
      <xui-descriptions title="Order #1024" [column]="3" bordered class="w-[640px]">
        <xui-descriptions-item label="Product">Widget Pro</xui-descriptions-item>
        <xui-descriptions-item label="Quantity">3</xui-descriptions-item>
        <xui-descriptions-item label="Status">Shipped</xui-descriptions-item>
        <xui-descriptions-item label="Address" [span]="3">221B Baker Street, London</xui-descriptions-item>
      </xui-descriptions>
    `
  })
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <xui-descriptions layout="vertical" [column]="3" bordered class="w-[560px]">
        <xui-descriptions-item label="Plan">Team</xui-descriptions-item>
        <xui-descriptions-item label="Seats">12</xui-descriptions-item>
        <xui-descriptions-item label="Renews">2026-08-01</xui-descriptions-item>
      </xui-descriptions>
    `
  })
};
