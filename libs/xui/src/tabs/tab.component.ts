import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TabGroupComponent } from './tab-group.component';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-container *ngIf="isActive"><ng-content></ng-content></ng-container>'
})
export class TabComponent implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  _isActive = false;
  @Input() title!: string;
  @Input() @InputBoolean() disabled = false;

  get isActive() {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    this.cdr.markForCheck();
  }

  constructor(private tabGroup: TabGroupComponent, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tabGroup.addTab(this);
  }
}
