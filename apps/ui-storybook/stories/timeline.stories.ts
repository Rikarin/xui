import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTimeline, XuiTimelineImports } from '@xui/timeline';

/**
 * A vertical timeline of events — colored dots on a connecting axis with
 * projected content and optional labels. Place the axis on the left or right.
 */
const meta: Meta<XuiTimeline> = {
  title: 'Data display/Timeline',
  component: XuiTimeline,
  decorators: [moduleMetadata({ imports: [XuiTimelineImports] })]
};

export default meta;
type Story = StoryObj<XuiTimeline>;

export const Basic: Story = {
  render: () => ({
    template: `
      <xui-timeline class="w-[360px]">
        <xui-timeline-item color="success" label="2026-07-20 09:00">Order created</xui-timeline-item>
        <xui-timeline-item color="primary" label="2026-07-20 12:30">Payment confirmed</xui-timeline-item>
        <xui-timeline-item color="warning" label="2026-07-21">Awaiting shipment</xui-timeline-item>
        <xui-timeline-item color="muted">Delivered</xui-timeline-item>
      </xui-timeline>
    `
  })
};

export const RightAxis: Story = {
  render: () => ({
    template: `
      <xui-timeline mode="right" class="w-[360px]">
        <xui-timeline-item color="primary">Design</xui-timeline-item>
        <xui-timeline-item color="primary">Build</xui-timeline-item>
        <xui-timeline-item color="error">Blocked on review</xui-timeline-item>
        <xui-timeline-item color="success">Shipped</xui-timeline-item>
      </xui-timeline>
    `
  })
};
