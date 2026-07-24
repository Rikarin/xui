import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiFileInput, XuiFileInputImports } from '@xui/file-input';

/**
 * A styled file picker over a real hidden `<input type="file">`, so the native
 * picker, `accept` and `multiple` all work. Its value is the `FileList` (or
 * `null`); a file input is write-only, so a form can only clear it.
 */
const meta: Meta<XuiFileInput> = {
  title: 'Forms/File input',
  component: XuiFileInput,
  decorators: [moduleMetadata({ imports: [XuiFileInputImports] })],
  argTypes: { size: { control: 'inline-radio', options: ['default', 'sm'] } }
};

export default meta;
type Story = StoryObj<XuiFileInput>;

export const Default: Story = {
  render: () => ({ template: `<xui-file-input class="w-96" />` })
};

/** Restricted to images, several at a time — the label summarises the count. */
export const Multiple: Story = {
  render: () => ({ template: `<xui-file-input class="w-96" accept="image/*" multiple text="Choose images…" />` })
};

export const Small: Story = {
  render: () => ({ template: `<xui-file-input class="w-80" size="sm" buttonText="Upload" />` })
};

export const Disabled: Story = {
  render: () => ({ template: `<xui-file-input class="w-96" disabled />` })
};
