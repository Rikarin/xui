import { ElementRef, Injectable, signal } from '@angular/core';
import { GraphViewData, NodeGroup } from './graph-view.types';

@Injectable({
  providedIn: 'root'
})
export class GraphViewService {
  data!: GraphViewData;
  canvas!: ElementRef;
  paths = signal<string[]>([]);
  wireToolPath = signal<string | null>(null);

  dragMove() {
    this.paths.set([]);
    for (const connection of this.data.connections) {
      this.connect(connection.outputNode, connection.outputPort, connection.inputNode, connection.inputPort);
    }
  }

  private connect(outputNode: string, outputPort: string, inputNode: string, inputPort: string) {
    const output = this.canvas.nativeElement.querySelector(`[data-id="${outputNode}"]`);
    const input = this.canvas.nativeElement.querySelector(`[data-id="${inputNode}"]`);

    const padding = 0;
    const bezierWeight = 0.5;
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const startRect = output.querySelector(`[data-port="${outputPort}"]`).getBoundingClientRect();
    const endRect = input.querySelector(`[data-port="${inputPort}"]`).getBoundingClientRect();

    const start = {
      offsetLeft: startRect.left - canvasRect.left,
      offsetTop: startRect.top - canvasRect.top
    };

    const end = {
      offsetLeft: endRect.left - canvasRect.left,
      offsetTop: endRect.top - canvasRect.top
    };

    const x1 = start.offsetLeft + startRect.width / 2 - padding;
    const y1 = start.offsetTop + startRect.height / 2 - padding;
    const x4 = end.offsetLeft + endRect.width / 2 - padding;
    const y4 = end.offsetTop + endRect.height / 2 - padding;
    const dx = Math.abs(x4 - x1) * bezierWeight;

    let x2: number;
    let x3: number;

    if (x4 < x1) {
      x2 = x1 - dx;
      x3 = x4 + dx;
    } else {
      x2 = x1 + dx;
      x3 = x4 - dx;
    }

    this.paths.mutate(x => x.push(`M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`));
  }

  wireTool(node: string, port: string, xCursor: number, yCursor: number) {
    const n = this.canvas.nativeElement.querySelector(`[data-id="${node}"]`);

    const padding = 0;
    const bezierWeight = 0.5;
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const rect = n.querySelector(`[data-port="${port}"]`).getBoundingClientRect();

    const start = {
      offsetLeft: rect.left - canvasRect.left,
      offsetTop: rect.top - canvasRect.top
    };

    const end = {
      offsetLeft: xCursor - canvasRect.left,
      offsetTop: yCursor - canvasRect.top
    };

    const x1 = start.offsetLeft + rect.width / 2 - padding;
    const y1 = start.offsetTop + rect.height / 2 - padding;
    const x4 = end.offsetLeft;
    const y4 = end.offsetTop;
    const dx = Math.abs(x4 - x1) * bezierWeight;

    let x2;
    let x3;

    if (x4 < x1) {
      x2 = x1 - dx;
      x3 = x4 + dx;
    } else {
      x2 = x1 + dx;
      x3 = x4 - dx;
    }

    this.wireToolPath.set(`M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`);
  }

  getGroup(groupId?: string): NodeGroup {
    if (groupId == null) {
      return this.data.groups![0];
    }

    return this.data.groups!.find(x => x.id === groupId) ?? this.data.groups![0];
  }

  hasConnectedPort(node: string, port: string) {
    return this.data.connections.some(
      x => (x.outputNode === node && x.outputPort === port) || (x.inputNode === node && x.inputPort === port)
    );
  }
}
