import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSlider, XuiSliderImports } from '@xui/slider';

/**
 * A draggable handle along a track for choosing a number in a range. Drag the
 * handle or click the track; arrow keys step, Home/End jump to the bounds, and
 * PageUp/PageDown take larger strides. Full `ControlValueAccessor`.
 */
const meta: Meta<XuiSlider> = {
  title: 'Forms/Slider',
  component: XuiSlider,
  decorators: [moduleMetadata({ imports: [XuiSliderImports, FormsModule] })],
  argTypes: {
    intent: { control: 'inline-radio', options: ['none', 'primary', 'success', 'warning', 'danger'] }
  }
};

export default meta;
type Story = StoryObj<XuiSlider>;

export const Default: Story = {
  render: () => ({
    props: { value: 4 },
    template: `
      <div class="w-96">
        <xui-slider [min]="0" [max]="10" [(value)]="value" aria-label="Amount" />
        <p class="text-foreground-muted mt-2 text-sm">Value: {{ value }}</p>
      </div>
    `
  })
};

/** A wider range with labels every ten and a percentage formatter. */
export const Labelled: Story = {
  render: () => ({
    props: { value: 40, fmt: (v: number) => `${v}%` },
    template: `
      <div class="w-[28rem]">
        <xui-slider [min]="0" [max]="100" [stepSize]="1" [labelStepSize]="20" [labelRenderer]="fmt" [(value)]="value" aria-label="Volume" />
      </div>
    `
  })
};

/** Intent colours the track fill and handle border. */
export const Intents: Story = {
  render: () => ({
    template: `
      <div class="flex w-96 flex-col gap-8">
        <xui-slider intent="primary" [max]="10" [value]="3" aria-label="Primary" />
        <xui-slider intent="success" [max]="10" [value]="5" aria-label="Success" />
        <xui-slider intent="warning" [max]="10" [value]="7" aria-label="Warning" />
        <xui-slider intent="danger" [max]="10" [value]="9" aria-label="Danger" />
      </div>
    `
  })
};

/** Disabled sliders ignore pointer and keyboard input. */
export const Disabled: Story = {
  render: () => ({
    template: `<div class="w-96"><xui-slider disabled [max]="10" [value]="4" aria-label="Disabled" /></div>`
  })
};

/** Vertical orientation — min at the bottom. */
export const Vertical: Story = {
  render: () => ({
    props: { value: 6 },
    template: `<xui-slider vertical [min]="0" [max]="10" [labelStepSize]="2" [(value)]="value" aria-label="Vertical" />`
  })
};
