import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { GraphViewData } from './graph-view.types';
import { GraphViewService } from './graph-view.service';

@Component({
  selector: 'xui-graph-view',
  templateUrl: 'graph-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GraphViewService]
})
export class XuiGraphView implements AfterViewInit {
  gridScale = 15;
  selectedConnection?: number;

  get paths() {
    return this.graphViewService.paths;
  }

  get wireToolPath() {
    return this.graphViewService.wireToolPath;
  }

  @Input()
  get data() {
    return this.graphViewService.data;
  }

  set data(value: GraphViewData) {
    this.graphViewService.data = value;
  }

  @ViewChild('canvas') private set canvas(value: ElementRef) {
    this.graphViewService.canvas = value;
  }

  constructor(private graphViewService: GraphViewService) {}

  ngAfterViewInit() {
    this.graphViewService.dragMove();
  }

  selectConnection(index: number) {
    this.selectedConnection = index;
    console.log('selected connection', index);
  }

  dragCanvas() {
    console.log('dragging canvas');
  }
}
