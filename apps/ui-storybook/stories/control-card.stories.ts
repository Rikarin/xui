import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiControlCard, XuiControlCardImports } from '@xui/control-card';

/**
 * A selectable card wrapping a label and a checkbox/radio/switch indicator. The
 * whole card is the control — click or press Space/Enter to toggle — and it shows
 * an accented "selected" style while checked. Full `ControlValueAccessor`.
 */
const meta: Meta<XuiControlCard> = {
  title: 'Forms/Control card',
  component: XuiControlCard,
  decorators: [moduleMetadata({ imports: [XuiControlCardImports, FormsModule] })],
  argTypes: { type: { control: 'inline-radio', options: ['checkbox', 'radio', 'switch'] } }
};

export default meta;
type Story = StoryObj<XuiControlCard>;

export const Checkbox: Story = {
  render: () => ({
    props: { a: true, b: false },
    template: `
      <div class="flex w-80 flex-col gap-2">
        <xui-control-card [(checked)]="a">Enable notifications</xui-control-card>
        <xui-control-card [(checked)]="b">Share usage data</xui-control-card>
      </div>
    `
  })
};

export const Switch: Story = {
  render: () => ({
    props: { on: true },
    template: `
      <div class="w-80">
        <xui-control-card type="switch" [(checked)]="on">Dark mode</xui-control-card>
      </div>
    `
  })
};

/** Radio cards select but never toggle off — bind them to one value for grouping. */
export const Radio: Story = {
  render: () => ({
    props: { plan: 'pro' },
    template: `
      <div class="flex w-80 flex-col gap-2">
        <xui-control-card type="radio" [checked]="plan === 'free'" (checkedChange)="plan = 'free'">Free</xui-control-card>
        <xui-control-card type="radio" [checked]="plan === 'pro'" (checkedChange)="plan = 'pro'">Pro</xui-control-card>
        <xui-control-card type="radio" [checked]="plan === 'team'" (checkedChange)="plan = 'team'">Team</xui-control-card>
        <p class="text-foreground-muted mt-2 text-sm">Plan: {{ plan }}</p>
      </div>
    `
  })
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex w-80 flex-col gap-2">
        <xui-control-card disabled>Unavailable option</xui-control-card>
        <xui-control-card disabled checked="true">Locked on</xui-control-card>
      </div>
    `
  })
};
