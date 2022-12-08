import { Directive, ElementRef, Inject, Input, NgZone, Optional, ViewContainerRef } from '@angular/core';
import {
  _MatTooltipBase,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_SCROLL_STRATEGY,
  MatTooltipDefaultOptions,
  TooltipPosition
} from '@angular/material/tooltip';
import { ConnectedPosition, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { XuiTooltipComponent } from './tooltip.component';

@Directive({
  selector: '[xuiTooltip]',
  exportAs: 'xuiTooltip'
})
export class XuiTooltipDirective extends _MatTooltipBase<XuiTooltipComponent> {
  protected override readonly _tooltipComponent = XuiTooltipComponent;
  protected override readonly _cssClassPrefix = 'xui';

  @Input('xuiTooltip')
  override get message() {
    return super.message;
  }

  override set message(value) {
    super.message = value;
    super.message = this.translate.instant(value);
  }

  @Input('xuiTooltipPosition')
  override get position(): TooltipPosition {
    return super.position;
  }

  override set position(value: TooltipPosition) {
    super.position = value;
  }

  constructor(
    private translate: TranslateService,
    overlay: Overlay,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(MAT_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(MAT_TOOLTIP_DEFAULT_OPTIONS) defaultOptions: MatTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any
  ) {
    super(
      overlay,
      elementRef,
      scrollDispatcher,
      viewContainerRef,
      ngZone,
      platform,
      ariaDescriber,
      focusMonitor,
      scrollStrategy,
      dir,
      defaultOptions,
      _document
    );
    this._viewportMargin = 8; // this.MIN_VIEWPORT_TOOLTIP_THRESHOLD;
  }

  protected override _addOffset(position: ConnectedPosition): ConnectedPosition {
    const offset = 8; //UNBOUNDED_ANCHOR_GAP;
    const isLtr = !this._dir || this._dir.value == 'ltr';

    if (position.originY === 'top') {
      position.offsetY = -offset;
    } else if (position.originY === 'bottom') {
      position.offsetY = offset;
    } else if (position.originX === 'start') {
      position.offsetX = isLtr ? -offset : offset;
    } else if (position.originX === 'end') {
      position.offsetX = isLtr ? offset : -offset;
    }

    return position;
  }
}
