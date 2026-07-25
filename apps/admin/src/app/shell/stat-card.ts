import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matTrendingDownRound, matTrendingUpRound } from '@ng-icons/material-icons/round';
import { XuiCardImports } from '@xui/card';
import { XuiIconImports } from '@xui/icon';
import { XuiSkeletonImports } from '@xui/skeleton';
import { XuiStatisticImports } from '@xui/statistic';
import { XuiTextImports } from '@xui/text';
import { signedPercent } from '../core/format';

/**
 * One headline number with its change against the previous period.
 *
 * `goodWhenDown` exists because a falling refund rate is good news and a falling revenue is not —
 * colouring purely by sign would tell half of the cards to celebrate the wrong thing.
 */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, XuiCardImports, XuiIconImports, XuiSkeletonImports, XuiStatisticImports, XuiTextImports],
  providers: [provideIcons({ matTrendingUpRound, matTrendingDownRound })],
  host: { class: 'block' },
  template: `
    <div xuiCard [elevation]="1" class="h-full p-4">
      @if (loading()) {
        <xui-skeleton class="mb-3 h-3 w-24" />
        <xui-skeleton class="mb-3 h-7 w-32" />
        <xui-skeleton class="h-3 w-20" />
      } @else {
        <xui-statistic [title]="label()" [value]="value()" />

        <p class="mt-2 flex items-center gap-1 text-xs">
          <ng-icon
            xui
            size="sm"
            [name]="change() >= 0 ? 'matTrendingUpRound' : 'matTrendingDownRound'"
            [class]="positive() ? 'text-success' : 'text-error'"
          />
          <span [class]="positive() ? 'text-success' : 'text-error'">{{ formattedChange() }}</span>
          <span xuiText color="subtle" size="xs">vs previous 30 days</span>
        </p>
      }
    </div>
  `
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly change = input.required<number>();
  readonly loading = input(false, { transform: booleanAttribute });
  /** Set for metrics where a fall is the improvement, such as a refund rate. */
  readonly goodWhenDown = input(false, { transform: booleanAttribute });

  protected readonly positive = computed(() => (this.goodWhenDown() ? this.change() <= 0 : this.change() >= 0));
  protected readonly formattedChange = computed(() => signedPercent(this.change()));
}
