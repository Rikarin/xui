import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiInputOtp, XuiInputOtpImports } from '@xui/input-otp';

/**
 * A segmented one-time-code / PIN field. A single hidden input drives the row,
 * so native caret, paste and `one-time-code` autofill all work. `value` is
 * two-way bindable; `completed` fires when every slot is filled.
 */
const meta: Meta<XuiInputOtp> = {
  title: 'Data entry/Input OTP',
  component: XuiInputOtp,
  decorators: [moduleMetadata({ imports: [XuiInputOtpImports] })]
};

export default meta;
type Story = StoryObj<XuiInputOtp>;

export const Basic: Story = {
  render: () => ({
    props: { code: '' },
    template: `
      <div class="flex flex-col gap-4">
        <xui-input-otp [length]="6" [(value)]="code" />
        <span class="text-foreground-muted text-sm">Value: {{ code || '—' }}</span>
      </div>
    `
  })
};

export const FourDigits: Story = {
  render: () => ({
    props: { code: '' },
    template: `<xui-input-otp [length]="4" [(value)]="code" />`
  })
};

/** `mask` hides the entered characters — for a PIN. */
export const Masked: Story = {
  render: () => ({
    props: { code: '1234' },
    template: `<xui-input-otp [length]="4" mask [(value)]="code" />`
  })
};

/** `inputType="text"` accepts letters as well as digits. */
export const Alphanumeric: Story = {
  render: () => ({
    props: { code: '' },
    template: `<xui-input-otp [length]="5" inputType="text" [(value)]="code" />`
  })
};
