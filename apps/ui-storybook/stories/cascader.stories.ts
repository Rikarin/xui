import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCascader, XuiCascaderImports, type XuiCascaderOption } from '@xui/cascader';

const OPTIONS: XuiCascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'West Lake' },
          { value: 'yuhang', label: 'Yuhang' }
        ]
      },
      { value: 'ningbo', label: 'Ningbo' }
    ]
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [{ value: 'nanjing', label: 'Nanjing', children: [{ value: 'zhonghua', label: 'Zhonghua Gate' }] }]
  }
];

/**
 * A cascading column select — each level opens the next column of children;
 * choosing a leaf commits the whole path. `value` is the array of chosen values.
 */
const meta: Meta<XuiCascader> = {
  title: 'Data entry/Cascader',
  component: XuiCascader,
  decorators: [moduleMetadata({ imports: [XuiCascaderImports] })]
};

export default meta;
type Story = StoryObj<XuiCascader>;

export const Basic: Story = {
  render: () => ({
    props: { options: OPTIONS, value: [] },
    template: `
      <div class="flex flex-col gap-4">
        <xui-cascader [options]="options" [(value)]="value" placeholder="Select location" />
        <span class="text-foreground-muted text-sm">Path: {{ value.join(' / ') || '—' }}</span>
      </div>
    `
  })
};

export const Preselected: Story = {
  render: () => ({
    props: { options: OPTIONS, value: ['zhejiang', 'hangzhou', 'xihu'] },
    template: `<xui-cascader [options]="options" [(value)]="value" />`
  })
};
