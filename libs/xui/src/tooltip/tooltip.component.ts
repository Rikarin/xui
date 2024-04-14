import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Host,
  HostBinding,
  Inject,
  Optional,
  ViewChild
} from '@angular/core';
// import { _TooltipComponentBase } from '@angular/material/tooltip';

@Component({
  selector: 'xui-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  // template: `<div
  //   #tooltip
  //   [ngClass]="tooltipClass"
  //   (animationend)="_handleAnimationEnd($event)"
  //   [class.mdc-tooltip--multiline]="_isMultiline"
  // >
  //   <div>{{ message }}</div>
  // </div>`,
  host: {
    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
    // won't be rendered if the animations are disabled or there is no web animations polyfill.
    // TODO: rework these as host bindings
    // '[style.zoom]': 'isVisible() ? 1 : null',
    // '(mouseleave)': '_handleMouseLeave($event)',
    'aria-hidden': 'true'
  }
})
export class TooltipComponent /*extends _TooltipComponentBase*/ {
  /* Whether the tooltip text overflows to multiple lines */
  // _isMultiline = false;
  //
  // @HostBinding('class.x-tooltip')
  // get hostMainClass(): boolean {
  //   return true;
  // }
  //
  // @HostBinding('class.mdc-tooltip--multilin')
  // get isMultiline(): boolean {
  //   return this._isMultiline;
  // }
  //
  // /** Reference to the internal tooltip element. */
  // @ViewChild('tooltip', { static: true }) _tooltip!: ElementRef<HTMLElement>;
  //
  // _showAnimation = 'x-tooltip-show';
  // _hideAnimation = 'x-tooltip-hide';
  //
  // constructor(
  //   cdr: ChangeDetectorRef,
  //   private _elementRef: ElementRef<HTMLElement>,
  //   @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string
  // ) {
  //   super(cdr, animationMode);
  // }
  //
  // protected override _onShow(): void {
  //   this._isMultiline = this._isTooltipMultiline();
  //   // this._markForCheck();
  // }
  //
  // /** Whether the tooltip text has overflown to the next line */
  // private _isTooltipMultiline() {
  //   const rect = this._elementRef.nativeElement.getBoundingClientRect();
  //   return rect.height > 24 && rect.width >= 200;
  // }

  show(todo: any) {}
}
