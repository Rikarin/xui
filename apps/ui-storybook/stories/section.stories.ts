import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiSection, XuiSectionImports } from '@xui/section';
import { XuiTextImports } from '@xui/text';

const meta: Meta<XuiSection> = {
  title: 'Section',
  component: XuiSection,
  args: { title: 'Details', subtitle: 'Everything about this record', collapsible: false, compact: false },
  argTypes: {
    elevation: { options: [0, 1], control: { type: 'select' } },
    collapsible: { control: { type: 'boolean' } },
    compact: { control: { type: 'boolean' } }
  },
  decorators: [moduleMetadata({ imports: [XuiSectionImports, XuiButtonImports, XuiTextImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <xui-section
        class="max-w-lg"
        [title]="title"
        [subtitle]="subtitle"
        [collapsible]="collapsible"
        [compact]="compact"
      >
        <button right-element xuiButton size="sm" variant="outline">Edit</button>
        <xui-section-card>
          <p xuiText color="muted">A section splits into cards separated by hairlines.</p>
        </xui-section-card>
        <xui-section-card>
          <p xuiText color="muted">Each card supplies its own padding.</p>
        </xui-section-card>
      </xui-section>
    `
  })
};

export default meta;
type Story = StoryObj<XuiSection>;

export const Default: Story = {};

/** The header becomes a button wired to the panel with aria-expanded/aria-controls. */
export const Collapsible: Story = { args: { collapsible: true } };

export const Compact: Story = { args: { compact: true } };

export const WithoutHeader: Story = {
  render: () => ({
    template: `
      <xui-section class="max-w-lg">
        <xui-section-card><p xuiText color="muted">No title, so no header renders.</p></xui-section-card>
      </xui-section>
    `
  })
};
