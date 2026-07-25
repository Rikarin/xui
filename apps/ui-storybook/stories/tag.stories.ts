import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTag, XuiTagImports } from '@xui/tag';

/**
 * A compact label chip — richer than the static `xui-badge`. Intents, a subtle
 * `minimal` variant, `round`/`large`/`fill`, an optional leading icon, and a
 * removable ✕ that emits `removed`.
 */
const meta: Meta<XuiTag> = {
  title: 'Data display/Tag',
  component: XuiTag,
  decorators: [moduleMetadata({ imports: [XuiTagImports] })],
  argTypes: { intent: { control: 'inline-radio', options: ['none', 'primary', 'success', 'warning', 'danger'] } }
};

export default meta;
type Story = StoryObj<XuiTag>;

export const Intents: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <xui-tag>None</xui-tag>
        <xui-tag intent="primary">Primary</xui-tag>
        <xui-tag intent="success">Success</xui-tag>
        <xui-tag intent="warning">Warning</xui-tag>
        <xui-tag intent="danger">Danger</xui-tag>
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
        <xui-tag minimal intent="primary">Primary</xui-tag>
        <xui-tag minimal intent="success">Success</xui-tag>
        <xui-tag minimal intent="warning">Warning</xui-tag>
        <xui-tag minimal intent="danger">Danger</xui-tag>
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
          <xui-tag round large intent="primary" minimal removable (removed)="tags = tags.filter(x => x !== t)">{{ t }}</xui-tag>
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
        <xui-tag interactive intent="primary">Clickable</xui-tag>
        <xui-tag minimal>v2.0.0-alpha.8</xui-tag>
      </div>
    `
  })
};
