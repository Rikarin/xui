import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiEditableText, XuiEditableTextImports } from '@xui/editable-text';

/**
 * Inline click-to-edit text. Click (or focus + Enter) to edit; Enter or blur
 * confirms, Escape reverts. `multiline` uses a textarea. Full
 * `ControlValueAccessor` and `[(value)]` two-way binding.
 */
const meta: Meta<XuiEditableText> = {
  title: 'Forms/Editable text',
  component: XuiEditableText,
  decorators: [moduleMetadata({ imports: [XuiEditableTextImports, FormsModule] })]
};

export default meta;
type Story = StoryObj<XuiEditableText>;

export const Default: Story = {
  render: () => ({
    props: { name: 'Jane Cooper' },
    template: `
      <div class="w-72">
        <xui-editable-text class="text-lg font-medium" [(value)]="name" placeholder="Add a name" />
        <p class="text-foreground-muted mt-3 text-sm">Value: {{ name }}</p>
      </div>
    `
  })
};

export const Placeholder: Story = {
  render: () => ({
    template: `<div class="w-72"><xui-editable-text placeholder="Click to add a title" /></div>`
  })
};

/** A textarea for longer content; Enter inserts a newline, blur confirms. */
export const Multiline: Story = {
  render: () => ({
    props: { bio: 'A short bio.\nClick to edit across multiple lines.' },
    template: `<div class="w-96"><xui-editable-text multiline [(value)]="bio" placeholder="Add a bio" /></div>`
  })
};

export const Disabled: Story = {
  render: () => ({
    template: `<div class="w-72"><xui-editable-text disabled value="Cannot edit this" /></div>`
  })
};
