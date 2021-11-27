import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  OnChanges,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Directive()
export abstract class XuiTooltipBaseDirective implements OnChanges, AfterViewInit {
  // @Input('xuiTooltip') title: string;

  // visible = false;

  protected componentType: any;
  component?: XuiTooltipBaseComponent;

  constructor(private elementRef: ElementRef, private hostView: ViewContainerRef) {
    console.log('tooltip');
  }

  ngAfterViewInit() {}

  ngOnChanges() {}

  show() {
    this.component?.show();
  }

  hide() {
    this.component?.hide();
  }

  updatePosition() {
    this.component?.updatePosition();
  }

  protected createComponent() {
    this.component = this.hostView.createComponent(this.componentType).instance as XuiTooltipBaseComponent;
    this.component.setOverlayOrigin({ elementRef: this.elementRef });
  }
}

@UntilDestroy()
@Directive()
export abstract class XuiTooltipBaseComponent implements OnInit {
  origin!: CdkOverlayOrigin;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  show() {}

  hide() {}

  updatePosition() {}

  setOverlayOrigin(origin: CdkOverlayOrigin) {
    this.origin = origin;
    this.cdr.markForCheck();
  }
}
