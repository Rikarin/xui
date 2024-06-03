import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatusType } from './status.types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"></div>
    <svg>
      <clipPath id="x-status-idle-clip-path" clipPathUnits="objectBoundingBox">
        <path d="M0.564,0 A0.399,0.399,0,1,1,0,0.564 A0.502,0.502,0,1,0,0.564,0" />
      </clipPath>
    </svg>
    <svg>
      <clipPath id="x-status-dnd-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 M0.78,0.603 H0.22 a0.103,0.103,0,0,1,0,-0.205 H0.78 a0.103,0.103,0,1,1,0,0.205"
        />
      </clipPath>
    </svg>
    <svg>
      <clipPath id="x-status-offline-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 m0,0.76 A0.26,0.26,0,1,1,0.76,0.5 A0.26,0.26,0,0,1,0.5,0.76"
        />
      </clipPath>
    </svg>`
})
export class XuiStatus {
  @Input() type?: StatusType;

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-status': true
    };

    ret[`x-status-${this.type}`] = true;
    return ret;
  }
}
