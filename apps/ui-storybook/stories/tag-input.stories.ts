import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTagInput, XuiTagInputImports } from '@xui/tag-input';

/**
 * A token/chip input. Type and press Enter (or the separator) to add a tag; click
 * a tag's ✕ or press Backspace on an empty field to remove one. Paste splits on
 * the separator. `[(values)]` two-way binding and `ControlValueAccessor`.
 */
const meta: Meta<XuiTagInput> = {
  title: 'Forms/Tag input',
  component: XuiTagInput,
  decorators: [moduleMetadata({ imports: [XuiTagInputImports, FormsModule] })]
};

export default meta;
type Story = StoryObj<XuiTagInput>;

export const Default: Story = {
  render: () => ({
    props: { tags: ['design', 'angular'] },
    template: `
      <div class="w-96">
        <xui-tag-input [(values)]="tags" placeholder="Add a tag…" fill />
        <p class="text-foreground-muted mt-3 text-sm">Values: {{ tags.join(', ') }}</p>
      </div>
    `
  })
};

export const Empty: Story = {
  render: () => ({
    template: `<div class="w-96"><xui-tag-input fill placeholder="Type and press Enter" /></div>`
  })
};

/** Commit on blur and allow duplicate tags. */
export const AddOnBlurWithDuplicates: Story = {
  render: () => ({
    props: { tags: ['one'] },
    template: `<div class="w-96"><xui-tag-input fill addOnBlur allowDuplicates [(values)]="tags" placeholder="Blur to add" /></div>`
  })
};

export const Disabled: Story = {
  render: () => ({
    props: { tags: ['locked', 'readonly'] },
    template: `<div class="w-96"><xui-tag-input fill disabled [(values)]="tags" /></div>`
  })
};
