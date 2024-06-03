import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NodeGroup, NodePort } from './graph-view.types';
import { GraphViewService } from './graph-view.service';

@Component({
  selector: 'xui-node',
  templateUrl: 'node.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiNode {
  @Input() id!: string;
  @Input() title!: string;
  @Input() inputs!: NodePort[];
  @Input() outputs!: NodePort[];

  constructor(private graphViewService: GraphViewService) {}

  hasConnectedPort(port: string) {
    return this.graphViewService.hasConnectedPort(this.id, port);
  }

  getPortGroup(port: NodePort): NodeGroup {
    return this.graphViewService.getGroup(port.groupId);
  }

  dragNode() {
    this.graphViewService.dragMove();
  }

  drag(event: DragEvent) {
    // console.log('dragging', event);

    this.graphViewService.wireTool(this.id, 'input2', event.clientX, event.clientY);

    if (event.clientX === 0 && event.clientY === 0) {
      this.graphViewService.wireToolPath.set(null);
    }

    // event.preventDefault();
    event.stopPropagation();
  }

  dragStart(event: DragEvent) {
    event.dataTransfer!.setData('text', 'foobar');
  }

  dragEnd() {
    // this.parent.wireToolPath = null;
  }

  drop(event: DragEvent) {
    const node = event.dataTransfer!.getData('text');
    const port = event.dataTransfer!.getData('text/port');

    console.log('drop', event, node);
  }

  denyConnection(event: DragEvent) {
    // const node = event.dataTransfer!.getData('text');
    // const port = event.dataTransfer!.getData('text/port');
    //
    // console.log('allow', node, port);

    return false;
  }
}
