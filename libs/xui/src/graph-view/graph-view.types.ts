export interface NodePort {
  id: string;
  name: string;
  groupId?: string;
}

export interface Node {
  id: string;
  title: string;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface GraphViewData {
  nodes: Node[];
  connections: NodeConnection[];
  groups?: NodeGroup[];
}

export interface NodeConnection {
  outputNode: string;
  outputPort: string;
  inputNode: string;
  inputPort: string;
}

export interface NodeGroup {
  id: string;
  color: string;
}
