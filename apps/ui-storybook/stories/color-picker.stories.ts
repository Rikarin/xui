import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiColorPicker, XuiColorPickerImports } from '@xui/color-picker';

/**
 * A color picker — the swatch trigger opens a panel with a saturation/value
 * square, hue slider, optional alpha slider, a channel input row and preset
 * swatches. `value` is a two-way bindable hex string; the input row switches
 * between `HEX`, `HSL` and `LCH` via the `format` selector.
 */
const meta: Meta<XuiColorPicker> = {
  title: 'Forms/Color picker',
  component: XuiColorPicker,
  decorators: [moduleMetadata({ imports: [XuiColorPickerImports] })]
};

export default meta;
type Story = StoryObj<XuiColorPicker>;

export const Basic: Story = {
  render: () => ({
    props: { color: '#1677FF' },
    template: `
      <div class="flex flex-col gap-4">
        <xui-color-picker [(value)]="color" [presets]="['#f5222d','#fa8c16','#52c41a','#1677ff','#722ed1']" />
        <div class="flex items-center gap-2">
          <span class="border-border h-8 w-16 rounded border" [style.background]="color"></span>
          <span class="text-foreground-muted text-sm">{{ color }}</span>
        </div>
      </div>
    `
  })
};

export const WithAlpha: Story = {
  render: () => ({
    props: { color: '#1677FFCC' },
    template: `
      <div class="flex flex-col gap-4">
        <xui-color-picker [(value)]="color" showAlpha />
        <span class="text-foreground-muted text-sm">{{ color }}</span>
      </div>
    `
  })
};

/**
 * `format` picks which channel model the input row edits. It's also switchable
 * in-panel via the selector, so one picker can flip between HEX, HSL and LCH.
 */
export const InputFormats: Story = {
  render: () => ({
    // NB: prop names must not collide with component members (e.g. `hex`) — Storybook
    // assigns `props` onto the component instance, which would clobber that member.
    props: { hexColor: '#722ED1', hslColor: '#722ED1', lchColor: '#722ED1' },
    template: `
      <div class="flex gap-8">
        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium">HEX</span>
          <xui-color-picker [(value)]="hexColor" format="hex" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium">HSL</span>
          <xui-color-picker [(value)]="hslColor" format="hsl" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium">LCH</span>
          <xui-color-picker [(value)]="lchColor" format="lch" />
        </div>
      </div>
    `
  })
};
