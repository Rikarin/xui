import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { XuiTabGroupComponent } from './tab-group.component';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-tab',
  exportAs: 'xuiTab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-container *ngIf="isActive"><ng-content></ng-content></ng-container>'
})
export class XuiTabComponent implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  _isActive = false;
  @Input() title!: string;
  @Input() @InputBoolean() disabled = false;

  get isActive() {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    this.changeDetectorRef.markForCheck();
  }

  constructor(private tabGroup: XuiTabGroupComponent, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.tabGroup.addTab(this);
  }
}
