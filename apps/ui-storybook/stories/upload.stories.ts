import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiUpload, XuiUploadImports, type XuiUploadFile } from '@xui/upload';

/**
 * A file upload — a button or a drag-and-drop zone with a file list showing size,
 * progress and a remove control. `files` is two-way bindable; `selected` emits
 * the raw `File`s for the host to upload.
 */
const meta: Meta<XuiUpload> = {
  title: 'Data entry/Upload',
  component: XuiUpload,
  decorators: [moduleMetadata({ imports: [XuiUploadImports] })]
};

export default meta;
type Story = StoryObj<XuiUpload>;

export const Button: Story = {
  render: () => ({
    props: { files: [] as XuiUploadFile[] },
    template: `<xui-upload multiple [(files)]="files" />`
  })
};

export const Dragger: Story = {
  render: () => ({
    props: {
      files: [
        { uid: '1', name: 'annual-report.pdf', size: 2_400_000, status: 'done' },
        { uid: '2', name: 'photo.png', size: 840_000, status: 'uploading', percent: 62 },
        { uid: '3', name: 'broken.zip', size: 12_000, status: 'error' }
      ] as XuiUploadFile[]
    },
    template: `<xui-upload type="drag" multiple [(files)]="files" class="w-[420px]" />`
  })
};
