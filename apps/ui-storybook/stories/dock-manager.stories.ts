import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiDockManager, XuiDockManagerImports, type XuiDockManagerLayout } from '@xui/dock-manager';
import { XuiInputImports } from '@xui/input';
import { XuiTextareaImports } from '@xui/textarea';

/**
 * An IDE-style docking layout driven by one serialisable tree: resizable split
 * panes, tab groups, a document host for editor tabs, panes that collapse to the
 * edges, and floating windows.
 *
 * Drag a pane header or tab and Visual Studio's docking targets appear: a
 * five-way joystick over the pane under the pointer — arms to split it, centre to
 * tab with it — plus an outer ring at the edges for docking against the whole
 * layout. The target that would be used lights up and an outline previews the
 * space it would take. Drop outside the layout to float the pane.
 *
 * Every action is also on the header: pin, float, maximize, close. Splitter
 * gutters take arrow keys, and tab strips take arrow/Home/End.
 *
 * A pane's body is declared once as `<ng-template xuiDockContent="id">` and then
 * *moved* rather than rebuilt, so scroll position and half-typed input survive a
 * drag.
 */
const meta: Meta<XuiDockManager> = {
  title: 'Layout/Dock manager',
  component: XuiDockManager,
  decorators: [moduleMetadata({ imports: [XuiDockManagerImports, XuiInputImports, XuiTextareaImports] })]
};

export default meta;
type Story = StoryObj<XuiDockManager>;

const body = (text: string) => `<div class="text-foreground-muted p-3 text-sm">${text}</div>`;

const list = (items: string[]) => `
  <ul class="text-foreground-muted m-0 list-none p-2 text-sm">
    ${items.map(item => `<li class="hover:bg-hover-overlay rounded px-2 py-1">${item}</li>`).join('')}
  </ul>
`;

/** A two-pane split: the smallest useful layout. */
export const Default: Story = {
  render: () => ({
    props: {
      layout: {
        rootPane: {
          type: 'splitPane',
          orientation: 'horizontal',
          panes: [
            { type: 'contentPane', contentId: 'explorer', header: 'Explorer', size: 1 },
            { type: 'contentPane', contentId: 'details', header: 'Details', size: 2 }
          ]
        }
      } satisfies XuiDockManagerLayout
    },
    template: `
      <xui-dock-manager [(layout)]="layout" class="border-border h-[26rem] w-[52rem] rounded-lg border">
        <ng-template xuiDockContent="explorer">${list(['src', 'libs', 'apps', 'package.json'])}</ng-template>
        <ng-template xuiDockContent="details">${body('Select something on the left.')}</ng-template>
      </xui-dock-manager>
    `
  })
};

/**
 * The full arrangement: a sidebar, a document host holding editor tabs, a tool
 * pane collapsed to the right edge, a tabbed panel below and one floating window.
 */
export const Ide: Story = {
  render: () => ({
    props: {
      layout: {
        rootPane: {
          type: 'splitPane',
          orientation: 'horizontal',
          panes: [
            { type: 'contentPane', contentId: 'explorer', header: 'Explorer', size: 1 },
            {
              type: 'splitPane',
              orientation: 'vertical',
              size: 4,
              panes: [
                {
                  type: 'documentHost',
                  size: 3,
                  rootPane: {
                    type: 'splitPane',
                    orientation: 'horizontal',
                    allowEmpty: true,
                    panes: [
                      {
                        type: 'tabGroupPane',
                        panes: [
                          { type: 'contentPane', contentId: 'doc1', header: 'dock-manager.ts', documentOnly: true },
                          { type: 'contentPane', contentId: 'doc2', header: 'README.md', documentOnly: true }
                        ]
                      }
                    ]
                  }
                },
                {
                  type: 'tabGroupPane',
                  size: 1,
                  panes: [
                    { type: 'contentPane', contentId: 'terminal', header: 'Terminal' },
                    { type: 'contentPane', contentId: 'problems', header: 'Problems' }
                  ]
                }
              ]
            },
            { type: 'contentPane', contentId: 'outline', header: 'Outline', size: 1, isPinned: false }
          ]
        },
        floatingPanes: [
          {
            type: 'splitPane',
            orientation: 'horizontal',
            floatingLocation: { x: 420, y: 220 },
            floatingWidth: 260,
            floatingHeight: 160,
            panes: [{ type: 'contentPane', contentId: 'search', header: 'Search' }]
          }
        ]
      } satisfies XuiDockManagerLayout
    },
    template: `
      <xui-dock-manager [(layout)]="layout" class="border-border h-[34rem] w-[60rem] rounded-lg border">
        <ng-template xuiDockContent="explorer">${list(['dock-manager.ts', 'dock-content.ts', 'README.md'])}</ng-template>
        <!-- A bare "&#123;" would start an ICU expression in an Angular template. -->
        <ng-template xuiDockContent="doc1">${body('export class XuiDockManager …')}</ng-template>
        <ng-template xuiDockContent="doc2">${body('# @xui/dock-manager')}</ng-template>
        <ng-template xuiDockContent="terminal">
          <pre class="text-foreground-muted m-0 p-3 text-xs">$ nx build dock-manager
  Built @xui/dock-manager</pre>
        </ng-template>
        <ng-template xuiDockContent="problems">${body('No problems detected.')}</ng-template>
        <ng-template xuiDockContent="outline">${list(['XuiDockManager', 'XuiDockContent'])}</ng-template>
        <ng-template xuiDockContent="search">
          <div class="p-2">
            <input xuiInput size="sm" class="w-full" type="search" placeholder="Search…" />
          </div>
        </ng-template>
      </xui-dock-manager>
    `
  })
};

/**
 * Content survives being moved. Type into the field, then drag the pane's header
 * to another dock — the text is still there afterwards.
 */
export const PreservesContent: Story = {
  render: () => ({
    props: {
      layout: {
        rootPane: {
          type: 'splitPane',
          orientation: 'horizontal',
          panes: [
            { type: 'contentPane', contentId: 'form', header: 'Draft' },
            { type: 'contentPane', contentId: 'notes', header: 'Notes' }
          ]
        }
      } satisfies XuiDockManagerLayout
    },
    template: `
      <xui-dock-manager [(layout)]="layout" class="border-border h-[22rem] w-[46rem] rounded-lg border">
        <ng-template xuiDockContent="form">
          <div class="flex flex-col gap-2 p-3">
            <input xuiInput size="sm" placeholder="Type something, then drag this pane" />
            <textarea xuiTextarea size="sm" class="h-24" aria-label="Notes"></textarea>
          </div>
        </ng-template>
        <ng-template xuiDockContent="notes">${body('Drop the draft pane on any edge or centre.')}</ng-template>
      </xui-dock-manager>
    `
  })
};

/** Panes that opt out of individual actions via `allow*`. */
export const RestrictedPanes: Story = {
  render: () => ({
    props: {
      layout: {
        rootPane: {
          type: 'splitPane',
          orientation: 'horizontal',
          panes: [
            { type: 'contentPane', contentId: 'fixed', header: 'Fixed', allowClose: false, allowFloating: false },
            {
              type: 'contentPane',
              contentId: 'anchored',
              header: 'Anchored',
              allowDocking: false,
              allowPinning: false
            },
            { type: 'contentPane', contentId: 'free', header: 'Free' }
          ]
        }
      } satisfies XuiDockManagerLayout
    },
    template: `
      <xui-dock-manager [(layout)]="layout" class="border-border h-[20rem] w-[52rem] rounded-lg border">
        <ng-template xuiDockContent="fixed">${body('No close, no float.')}</ng-template>
        <ng-template xuiDockContent="anchored">${body('Cannot be dragged elsewhere or collapsed.')}</ng-template>
        <ng-template xuiDockContent="free">${body('Everything allowed.')}</ng-template>
      </xui-dock-manager>
    `
  })
};

/** The whole layout mirrored for right-to-left reading. */
export const RightToLeft: Story = {
  render: () => ({
    props: {
      layout: {
        rootPane: {
          type: 'splitPane',
          orientation: 'horizontal',
          panes: [
            { type: 'contentPane', contentId: 'explorer', header: 'المستكشف', size: 1 },
            { type: 'contentPane', contentId: 'details', header: 'التفاصيل', size: 2 }
          ]
        }
      } satisfies XuiDockManagerLayout
    },
    template: `
      <div dir="rtl">
        <xui-dock-manager [(layout)]="layout" class="border-border h-[20rem] w-[46rem] rounded-lg border">
          <ng-template xuiDockContent="explorer">${body('يبدأ الشريط الجانبي من اليمين.')}</ng-template>
          <ng-template xuiDockContent="details">${body('تتبع المقابض والمواضع اتجاه القراءة.')}</ng-template>
        </xui-dock-manager>
      </div>
    `
  })
};
