import { Directive, InjectionToken, forwardRef, input } from '@angular/core';

/** The nearest `XuiEChartGroup` above a chart, if any. */
export const XUI_ECHART_GROUP = new InjectionToken<XuiEChartGroup | null>('XUI_ECHART_GROUP', {
  providedIn: 'root',
  factory: () => null
});

/**
 * Links every chart inside it, so a tooltip, a brush or a zoom on one is
 * mirrored on the others — ECharts' `connect`, without the instance plumbing.
 *
 * ```html
 * <div xuiEChartGroup="traffic" class="grid gap-4 md:grid-cols-2">
 *   <xui-echart [option]="visits" />
 *   <xui-echart [option]="errors" />
 * </div>
 * ```
 *
 * Charts pick the group up through DI, so they may sit at any depth — inside
 * your own components, an `@for`, or a card. A chart's own `group` input wins
 * over the enclosing group.
 */
@Directive({
  selector: '[xuiEChartGroup]',
  exportAs: 'xuiEChartGroup',
  providers: [{ provide: XUI_ECHART_GROUP, useExisting: forwardRef(() => XuiEChartGroup) }]
})
export class XuiEChartGroup {
  /** Group name. Charts sharing a name share their interaction state. */
  readonly name = input.required<string>({ alias: 'xuiEChartGroup' });
}
