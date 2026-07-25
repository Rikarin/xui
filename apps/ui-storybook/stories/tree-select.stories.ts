import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTreeSelect, XuiTreeSelectImports, type XuiTreeSelectNode } from '@xui/tree-select';

const NODES: XuiTreeSelectNode[] = [
  {
    value: 'eng',
    label: 'Engineering',
    children: [
      {
        value: 'fe',
        label: 'Frontend',
        children: [
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' }
        ]
      },
      { value: 'be', label: 'Backend' }
    ]
  },
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'product', label: 'Product' },
      { value: 'brand', label: 'Brand' }
    ]
  }
];

/**
 * A select whose options form a tree — expand branches and pick nodes. Single
 * mode binds one value; `multiple` shows removable chips with checkboxes.
 */
const meta: Meta<XuiTreeSelect> = {
  title: 'Data entry/Tree select',
  component: XuiTreeSelect,
  decorators: [moduleMetadata({ imports: [XuiTreeSelectImports] })]
};

export default meta;
type Story = StoryObj<XuiTreeSelect>;

export const Single: Story = {
  render: () => ({
    props: { nodes: NODES, value: 'web' },
    template: `<xui-tree-select class="w-72" [nodes]="nodes" [(value)]="value" placeholder="Pick a team" />`
  })
};

export const Multiple: Story = {
  render: () => ({
    props: { nodes: NODES, value: ['fe', 'brand'] },
    template: `<xui-tree-select class="w-72" [nodes]="nodes" [(value)]="value" multiple placeholder="Pick teams" />`
  })
};
