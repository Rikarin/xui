export type EntityId = string & { readonly _: unique symbol };

// Group name of entities. e.g. Nodes, Routers
export interface EntityGroup {
  id: EntityId;
  name: string;
  icon: string;
  entities: Entity[];
}

// Specific entity from which to poll data
export interface Entity {
  id: EntityId;
  name: string;
  metrics: MetricGroup[];
}

// Group name of metrics. e.g. Visits, CPU / Memory, Alerts
export interface MetricGroup {
  id: EntityId;
  name: string;
  metrics: Metric[];
}

// Specific metric to be polled
export interface Metric {
  id: EntityId;
  // TODO type:
  name: string;
  subMetrics?: Metric[];
}
