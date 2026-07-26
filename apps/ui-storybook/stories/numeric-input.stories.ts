import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiNumericInput, XuiNumericInputImports } from '@xui/numeric-input';

/**
 * A number field with steppers and keyboard increment. The value is a
 * `number | null` (empty is `null`, not `0`). ArrowUp/Down step; Shift is the
 * coarse jump, Alt the fine nudge. Full `ControlValueAccessor`.
 */
const meta: Meta<XuiNumericInput> = {
  title: 'Forms/Numeric input',
  component: XuiNumericInput,
  decorators: [moduleMetadata({ imports: [XuiNumericInputImports, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    buttonPosition: { control: 'inline-radio', options: ['right', 'left', 'none'] }
  }
};

export default meta;
type Story = StoryObj<XuiNumericInput>;

export const Default: Story = {
  render: () => ({
    props: { qty: 3 },
    template: `
      <xui-numeric-input class="w-40" [(ngModel)]="qty" [min]="0" [max]="99" aria-label="Quantity" />
      <p class="text-foreground-muted mt-3 text-sm">Value: {{ qty === null ? 'null' : qty }}</p>
    `
  })
};

/** Try Arrow keys with Shift (×10) and Alt (fine), and watch it clamp at 0 and 10. */
export const Bounded: Story = {
  render: () => ({
    template: `<xui-numeric-input class="w-40" value="5" [min]="0" [max]="10" [minorStepSize]="0.25" aria-label="Rating" />`
  })
};

export const Small: Story = {
  render: () => ({ template: `<xui-numeric-input class="w-32" size="sm" value="1" aria-label="Count" />` })
};

/** Steppers on the left. */
export const ButtonsLeft: Story = {
  render: () => ({ template: `<xui-numeric-input class="w-40" buttonPosition="left" value="0" aria-label="Offset" />` })
};

/** No steppers — keyboard and typing only. */
export const NoButtons: Story = {
  render: () => ({
    template: `<xui-numeric-input class="w-40" buttonPosition="none" placeholder="0.00" [minorStepSize]="0.01" aria-label="Price" />`
  })
};
