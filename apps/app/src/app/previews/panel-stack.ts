import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { XuiCheckboxImports } from '@xui/checkbox';
import { XuiInputImports } from '@xui/input';
import { XuiPanelStackImports } from '@xui/panel-stack';
import { XuiTextImports } from '@xui/text';

/**
 * Each panel is an `ng-template` that receives the stack through a context variable, which a
 * generated preview cannot type. Written out here, where the templates are checked against the
 * component that owns them.
 *
 * Mirrors `apps/ui-storybook/stories/panel-stack.stories.ts`; keep the two in step.
 */
@Component({
  selector: 'docs-panel-stack-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiPanelStackImports, XuiButtonImports, XuiCheckboxImports, XuiInputImports, XuiTextImports],
  template: `
    <xui-panel-stack class="h-96 w-80" [initialPanel]="{ title: 'Settings', content: settings }" />

    <ng-template #settings let-stack="stack">
      <div class="flex flex-col p-2">
        <button
          xuiButton
          variant="ghost"
          class="justify-start"
          (click)="stack.openPanel({ title: 'Account', content: account, data: { user: 'rene' } })"
        >
          Account →
        </button>
        <button
          xuiButton
          variant="ghost"
          class="justify-start"
          (click)="stack.openPanel({ title: 'Notifications', content: notifications })"
        >
          Notifications →
        </button>
      </div>
    </ng-template>

    <ng-template #account let-data let-stack="stack">
      <div class="flex flex-col gap-3 p-4">
        <p xuiText size="sm" color="muted">
          Signed in as <b class="text-foreground">{{ data.user }}</b
          >.
        </p>
        <button
          xuiButton
          variant="outline"
          class="justify-start"
          (click)="stack.openPanel({ title: 'Password', content: password })"
        >
          Change password →
        </button>
      </div>
    </ng-template>

    <ng-template #notifications>
      <div class="flex flex-col gap-2 p-4">
        <xui-checkbox [checked]="true" label="Email" />
        <xui-checkbox label="Push" />
      </div>
    </ng-template>

    <ng-template #password>
      <div class="flex flex-col gap-3 p-4">
        <input xuiInput placeholder="New password" type="password" />
        <input xuiInput placeholder="Confirm" type="password" />
      </div>
    </ng-template>
  `
})
export class PreviewDefault {}
