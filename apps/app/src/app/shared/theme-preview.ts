import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XuiBadgeImports } from '@xui/badge';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCheckboxImports } from '@xui/checkbox';
import { XuiInputImports } from '@xui/input';
import { XuiProgressBarImports } from '@xui/progress-bar';
import { XuiSwitchImports } from '@xui/switch';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';

const INTENTS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

/** The tag's axis is deliberately shorter than the intent set — it has no `secondary` or `info`. */
const TAG_INTENTS = ['none', 'primary', 'success', 'warning', 'danger'] as const;

const CHARTS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * A page's worth of components under one theme.
 *
 * The whole site re-themes as you edit, so this is not the only feedback — it is the concentrated
 * version, putting every intent, both text emphases, all three surface depths and the control scale
 * next to each other, where a colour that works alone but not beside its neighbour shows up.
 */
@Component({
  selector: 'docs-theme-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    XuiBadgeImports,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCheckboxImports,
    XuiInputImports,
    XuiProgressBarImports,
    XuiSwitchImports,
    XuiTableImports,
    XuiTagImports,
    XuiTextImports
  ],
  host: { class: 'block' },
  template: `
    <div class="border-border bg-surface space-y-6 rounded-xl border p-5">
      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Intents</p>
        <div class="flex flex-wrap gap-2">
          @for (intent of intents; track intent) {
            <button xuiButton [color]="intent">{{ intent }}</button>
          }
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (intent of intents; track intent) {
            <button xuiButton variant="outline" [color]="intent">{{ intent }}</button>
          }
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (intent of intents; track intent) {
            <button xuiButton variant="ghost" [color]="intent">{{ intent }}</button>
          }
        </div>
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Control scale</p>
        <div class="flex flex-wrap items-center gap-2">
          <button xuiButton size="sm">Small</button>
          <button xuiButton>Default</button>
          <button xuiButton size="lg">Large</button>
          <input xuiInput class="w-40" value="Editable" aria-label="Sample input" />
        </div>
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Labels</p>
        <div class="flex flex-wrap items-center gap-2">
          @for (intent of tagIntents; track intent) {
            <xui-tag [intent]="intent">{{ intent }}</xui-tag>
          }
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          @for (intent of tagIntents; track intent) {
            <xui-tag minimal [intent]="intent">{{ intent }}</xui-tag>
          }
          <span xuiBadge color="primary">12</span>
          <span xuiBadge color="error">99+</span>
        </div>
      </section>

      <section class="space-y-2">
        <p xuiText size="xs" weight="semibold" color="subtle" class="tracking-wide uppercase">Feedback</p>
        <xui-callout color="primary" title="Deploy queued">Rolling out to production in a moment.</xui-callout>
        <xui-callout color="warning" title="Check the contrast">
          A subtle surface hides a subtle border. Both are yours to move.
        </xui-callout>
        <xui-progress-bar [value]="62" />
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Form</p>
        <div class="flex flex-wrap items-center gap-4">
          <xui-checkbox label="Remember me" [checked]="true" />
          <span class="flex items-center gap-2 text-sm">
            <xui-switch [checked]="true" aria-labelledby="preview-switch-label" />
            <span id="preview-switch-label">Notifications</span>
          </span>
          <a class="text-link hover:text-link-hover text-sm underline" href="#preview">A link</a>
        </div>
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Surfaces</p>
        <div class="bg-background border-border rounded-lg border p-3">
          <p xuiText size="sm">Background</p>
          <div class="bg-surface border-border mt-2 rounded-lg border p-3">
            <p xuiText size="sm">Surface</p>
            <div class="bg-surface-raised border-border mt-2 rounded-lg border p-3">
              <p xuiText size="sm">Surface raised</p>
              <p xuiText size="sm" color="muted">Muted copy on it</p>
              <p xuiText size="sm" color="subtle">Subtle copy on it</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Table</p>
        <xui-table bordered compact class="w-full">
          <xui-tr>
            <xui-th class="min-w-0 flex-1">Service</xui-th>
            <xui-th class="w-28 shrink-0">Status</xui-th>
          </xui-tr>
          @for (row of rows; track row.name) {
            <xui-tr>
              <xui-td class="min-w-0 flex-1">{{ row.name }}</xui-td>
              <xui-td class="w-28 shrink-0"
                ><xui-tag minimal [intent]="row.intent">{{ row.status }}</xui-tag></xui-td
              >
            </xui-tr>
          }
        </xui-table>
      </section>

      <section>
        <p xuiText size="xs" weight="semibold" color="subtle" class="mb-2 tracking-wide uppercase">Chart series</p>
        <div class="flex h-16 items-end gap-1.5">
          @for (series of charts; track series; let i = $index) {
            <span
              class="flex-1 rounded-t"
              [style.background]="'var(--chart-' + series + ')'"
              [style.height.%]="heights[i]"
            ></span>
          }
        </div>
      </section>
    </div>
  `
})
export class ThemePreview {
  protected readonly intents = INTENTS;
  protected readonly tagIntents = TAG_INTENTS;
  protected readonly charts = CHARTS;
  protected readonly heights = [92, 70, 84, 55, 66, 40, 78, 48];

  protected readonly rows = [
    { name: 'api-gateway', status: 'Healthy', intent: 'success' as const },
    { name: 'worker-queue', status: 'Degraded', intent: 'warning' as const },
    { name: 'image-resize', status: 'Down', intent: 'danger' as const }
  ];
}
