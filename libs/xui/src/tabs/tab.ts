import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  Input,
  OnInit
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { TAB_GROUP_ACCESSOR, TabGroupAccessor } from './tab.types';

@Component({
  selector: 'xui-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-container *ngIf="isActive"><ng-content /></ng-container>'
})
export class XuiTab implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() title!: string;
  @Input() @InputBoolean() disabled = false;

  @HostBinding('class.x-tab')
  get mainHostClass(): boolean {
    return true;
  }

  get isActive() {
    return this.tabGroup._active === this;
  }

  constructor(
    @Inject(TAB_GROUP_ACCESSOR) private tabGroup: TabGroupAccessor,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.tabGroup.onChange$.subscribe(() => this.cdr.markForCheck());
  }
}
