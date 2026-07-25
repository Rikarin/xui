import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiResult, XuiResultImports } from '@xui/result';

/**
 * A result / status page — status glyph, title, subtitle, body content and an
 * `[xuiResultExtra]` action slot. Covers success/error/warning/info and the
 * 404/403/500 HTTP codes.
 */
const meta: Meta<XuiResult> = {
  title: 'Feedback/Result',
  component: XuiResult,
  decorators: [moduleMetadata({ imports: [XuiResultImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiResult>;

export const Success: Story = {
  render: () => ({
    template: `
      <xui-result status="success" title="Payment received" subtitle="Order #1024 is confirmed and on its way.">
        <button xuiButton color="primary" xuiResultExtra>Go to orders</button>
        <button xuiButton xuiResultExtra>Buy again</button>
      </xui-result>
    `
  })
};

export const Error: Story = {
  render: () => ({
    template: `
      <xui-result status="error" title="Submission failed" subtitle="Please check the highlighted fields and try again.">
        <button xuiButton color="primary" xuiResultExtra>Try again</button>
      </xui-result>
    `
  })
};

export const NotFound: Story = {
  render: () => ({
    template: `
      <xui-result status="404" title="Page not found" subtitle="Sorry, the page you visited does not exist.">
        <button xuiButton color="primary" xuiResultExtra>Back home</button>
      </xui-result>
    `
  })
};
