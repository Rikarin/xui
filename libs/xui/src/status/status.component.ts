import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { StatusType } from './status.types';

@Component({
  selector: 'xui-status',
  exportAs: 'xuiStatus',
  styleUrls: ['./status.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"></div>
    <svg class="svg">
      <clipPath id="xui-idle-clip-path" clipPathUnits="objectBoundingBox">
        <path d="M0.564,0 A0.399,0.399,0,1,1,0,0.564 A0.502,0.502,0,1,0,0.564,0"></path>
      </clipPath>
    </svg>
    <svg class="svg">
      <clipPath id="xui-dnd-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 M0.78,0.603 H0.22 a0.103,0.103,0,0,1,0,-0.205 H0.78 a0.103,0.103,0,1,1,0,0.205"
        ></path>
      </clipPath>
    </svg>
    <svg class="svg">
      <clipPath id="xui-offline-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 m0,0.76 A0.26,0.26,0,1,1,0.76,0.5 A0.26,0.26,0,0,1,0.5,0.76"
        ></path>
      </clipPath>
    </svg>`
})
export class XuiStatusComponent {
  @Input() type?: StatusType;

  get styles() {
    const ret: { [klass: string]: boolean } = {
      status: true
    };

    ret[`type-${this.type}`] = true;
    return ret;
  }
}
