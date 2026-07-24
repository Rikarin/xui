import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSwitch, XuiSwitchImports } from '@xui/switch';

/**
 * A toggle for an immediate on/off setting. A real `role="switch"` button:
 * Space/Enter toggle it, and it is a `ControlValueAccessor`, so `ngModel` and
 * reactive forms bind straight to it.
 */
const meta: Meta<XuiSwitch> = {
  title: 'Forms/Switch',
  component: XuiSwitch,
  decorators: [moduleMetadata({ imports: [XuiSwitchImports, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'large'] }
  }
};

export default meta;
type Story = StoryObj<XuiSwitch>;

export const Default: Story = { args: { ariaLabel: 'Wi-Fi' } };

export const Large: Story = { args: { size: 'large', ariaLabel: 'Wi-Fi' } };

export const Checked: Story = { args: { checked: true, ariaLabel: 'Wi-Fi' } };

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex gap-4">
        <xui-switch aria-label="off" disabled />
        <xui-switch aria-label="on" checked disabled />
      </div>
    `
  })
};

/** In a label, with two-way binding. */
export const WithLabel: Story = {
  render: () => ({
    props: { on: true },
    template: `
      <label class="flex items-center gap-2 text-sm">
        <xui-switch [(checked)]="on" /> Push notifications — {{ on ? 'on' : 'off' }}
      </label>
    `
  })
};
