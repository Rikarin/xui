import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTag, XuiTagImports } from '@xui/tag';

/**
 * A compact label chip. Colours, a subtle
 * `minimal` variant, `round`/`large`/`fill`, an optional leading icon, and a
 * removable ✕ that emits `removed`.
 */
const meta: Meta<XuiTag> = {
  title: 'Data display/Tag',
  component: XuiTag,
  decorators: [moduleMetadata({ imports: [XuiTagImports] })],
  argTypes: { color: { control: 'inline-radio', options: ['none', 'primary', 'success', 'warning', 'error'] } }
};

export default meta;
type Story = StoryObj<XuiTag>;

export const Colors: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <xui-tag>None</xui-tag>
        <xui-tag color="primary">Primary</xui-tag>
        <xui-tag color="success">Success</xui-tag>
        <xui-tag color="warning">Warning</xui-tag>
        <xui-tag color="error">Error</xui-tag>
      </div>
    `
  })
};

/** The subtle, bordered `minimal` treatment. */
export const Minimal: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <xui-tag minimal>None</xui-tag>
        <xui-tag minimal color="primary">Primary</xui-tag>
        <xui-tag minimal color="success">Success</xui-tag>
        <xui-tag minimal color="warning">Warning</xui-tag>
        <xui-tag minimal color="error">Error</xui-tag>
      </div>
    `
  })
};

/** Rounded, large, and removable. */
export const Removable: Story = {
  render: () => ({
    props: { tags: ['design', 'angular', 'signals'] },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        @for (t of tags; track t) {
          <xui-tag round large color="primary" minimal removable (removed)="tags = tags.filter(x => x !== t)">{{ t }}</xui-tag>
        }
      </div>
    `
  })
};

/** With a leading icon and an interactive (clickable) affordance. */
export const IconAndInteractive: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <xui-tag interactive color="primary">Clickable</xui-tag>
        <xui-tag minimal>v2.0.0-alpha.8</xui-tag>
      </div>
    `
  })
};
