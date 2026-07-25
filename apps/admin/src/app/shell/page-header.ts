import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XuiTextImports } from '@xui/text';

/**
 * The title block every page opens with, plus a slot for that page's actions.
 *
 * Worth a component rather than a copied `<h1>`: it is what keeps the heading level, the spacing
 * and the wrap behaviour of the action row identical across five pages.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiTextImports],
  host: { class: 'mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3' },
  template: `
    <div class="min-w-0">
      <h1 xuiHeading [level]="1" class="text-2xl sm:text-3xl">{{ title() }}</h1>
      @if (description()) {
        <p xuiText color="muted" class="mt-1 max-w-2xl">{{ description() }}</p>
      }
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <ng-content />
    </div>
  `
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
