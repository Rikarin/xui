import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDescriptionRound, matFolderRound, matImageRound } from '@ng-icons/material-icons/round';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTree, XuiTreeImports, type XuiTreeNode } from '@xui/tree';

/**
 * A hierarchical tree with expand/collapse carets, single selection, optional
 * icons and secondary labels. Full keyboard support: Up/Down move, Right/Left
 * expand/collapse or step in/out, Enter/Space select. `[(selectedId)]` binding.
 */
const meta: Meta<XuiTree> = {
  title: 'Data display/Tree',
  component: XuiTree,
  decorators: [
    moduleMetadata({
      imports: [XuiTreeImports, NgIcon],
      providers: [provideIcons({ matFolderRound, matDescriptionRound, matImageRound })]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiTree>;

const NODES: XuiTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: 'matFolderRound',
    isExpanded: true,
    children: [
      {
        id: 'app',
        label: 'app',
        icon: 'matFolderRound',
        isExpanded: true,
        children: [
          { id: 'main', label: 'main.ts', icon: 'matDescriptionRound', secondaryLabel: '1 kB' },
          { id: 'app.component', label: 'app.component.ts', icon: 'matDescriptionRound', secondaryLabel: '4 kB' }
        ]
      },
      {
        id: 'assets',
        label: 'assets',
        icon: 'matFolderRound',
        children: [{ id: 'logo', label: 'logo.svg', icon: 'matImageRound' }]
      },
      { id: 'index', label: 'index.html', icon: 'matDescriptionRound', secondaryLabel: '2 kB' }
    ]
  },
  { id: 'readme', label: 'README.md', icon: 'matDescriptionRound' },
  { id: 'license', label: 'LICENSE', icon: 'matDescriptionRound', disabled: true }
];

export const Default: Story = {
  render: () => ({
    props: { nodes: NODES, selected: 'main' },
    template: `<div class="w-80"><xui-tree [nodes]="nodes" [(selectedId)]="selected" aria-label="File explorer" /></div>`
  })
};
