import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  inject,
  input,
  TemplateRef,
  viewChild,
  ViewEncapsulation
} from '@angular/core';

/**
 * Marks an `<ng-template>` inside a `xui-tab` as the tab's title, for when a
 * plain `title` string is not enough (icons, tags, …).
 *
 * ```html
 * <xui-tab id="files">
 *   <ng-template xuiTabTitle>Files <xui-tag>3</xui-tag></ng-template>
 *   …panel…
 * </xui-tab>
 * ```
 */
@Directive({ selector: '[xuiTabTitle]', exportAs: 'xuiTabTitle' })
export class XuiTabTitle {
  readonly template = inject(TemplateRef);
}

/**
 * A single tab. Its projected content is the panel body (rendered lazily via an
 * `<ng-template>`); the tab strip label comes from the `title` input or a
 * `[xuiTabTitle]` template.
 */
@Component({
  selector: 'xui-tab',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTab {
  /** Stable identifier used for selection and ARIA wiring. */
  readonly id = input.required<string>();

  /** Plain-text tab-strip label (ignored when a `[xuiTabTitle]` template is given). */
  readonly title = input<string>('');

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Optional rich title template. */
  readonly titleTemplate = contentChild(XuiTabTitle);

  /** The panel body, rendered on demand by `xui-tabs`. */
  readonly content = viewChild.required(TemplateRef);
}
