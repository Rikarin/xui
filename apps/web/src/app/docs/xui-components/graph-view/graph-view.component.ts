import { Component } from '@angular/core';
import { GraphViewData } from '@xui/components';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.scss']
})
export class GraphViewComponent {
  graphData: GraphViewData = {
    nodes: [
      {
        id: 'node1',
        title: 'Node 1',
        inputs: [
          { id: 'input1', name: 'Input 1' },
          { id: 'input2', name: 'Input 2', groupId: 'group2' },
          { id: 'input3', name: 'Input 3' }
        ],
        outputs: [
          { id: 'output1', name: 'Output 1' },
          { id: 'output2', name: 'Output 2' },
          { id: 'output3', name: 'Output 3' }
        ]
      },
      {
        id: 'node2',
        title: 'Node 2',
        inputs: [
          { id: 'input1', name: 'Input 1' },
          { id: 'input2', name: 'Input 2' },
          { id: 'input3', name: 'Input 3' }
        ],
        outputs: [
          { id: 'output1', name: 'Output 1' },
          { id: 'output2', name: 'Output 2' },
          { id: 'output3', name: 'Output 3', groupId: 'group2' }
        ]
      },
      {
        id: 'node3',
        title: 'Node 3',
        inputs: [
          { id: 'input1', name: 'Input 1' },
          { id: 'input2', name: 'Input 2' },
          { id: 'input3', name: 'Input 3' }
        ],
        outputs: [
          { id: 'output1', name: 'Output 1' },
          { id: 'output2', name: 'Output 2' },
          { id: 'output3', name: 'Output 3' }
        ]
      }
    ],
    connections: [
      {
        outputNode: 'node1',
        outputPort: 'output2',
        inputNode: 'node3',
        inputPort: 'input1'
      },
      {
        outputNode: 'node1',
        outputPort: 'output2',
        inputNode: 'node2',
        inputPort: 'input3'
      }
    ],
    groups: [
      {
        id: 'default',
        color: 'blue'
      },
      {
        id: 'group2',
        color: 'yellow'
      }
    ]
  };
}
