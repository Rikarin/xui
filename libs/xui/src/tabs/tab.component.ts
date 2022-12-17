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

  @Input() title!: string;
  @Input() @InputBoolean() disabled = false;

  get isActive() {
    return this.tabGroup._active === this;
  }

  constructor(private tabGroup: TabGroupComponent, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tabGroup.onChange$.subscribe(() => this.cdr.markForCheck());
  }
}
