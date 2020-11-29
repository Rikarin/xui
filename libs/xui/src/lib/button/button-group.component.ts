import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'xui-button-group',
  exportAs: 'xuiButtonGroup',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
})
export class XuiButtonGroupComponent {
  // @Input() xSize: 'sm' | 'md' | 'lg' = 'md';
}
