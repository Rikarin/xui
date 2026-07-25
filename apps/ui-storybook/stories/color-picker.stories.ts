import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiColorPicker, XuiColorPickerImports } from '@xui/color-picker';

/**
 * A color picker — the swatch trigger opens a panel with a saturation/value
 * square, hue slider, optional alpha slider, hex field and preset swatches.
 * `value` is a two-way bindable hex string.
 */
const meta: Meta<XuiColorPicker> = {
  title: 'Data entry/Color picker',
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
