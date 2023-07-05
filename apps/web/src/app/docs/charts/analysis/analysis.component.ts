import { Component } from '@angular/core';
import { EntityGroup, EntityId, MetricGroup } from '@xui/charts';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent {
  metrics: MetricGroup[] = [
    {
      id: 'metric-group-1' as EntityId,
      name: 'CPU / Memory',
      metrics: [
        {
          id: 'metric-1' as EntityId,
          name: 'Average CPU Load'
        },
        {
          id: 'metric-2' as EntityId,
          name: 'Average Memory Load'
        }
      ]
    },
    {
      id: 'metric-group-2' as EntityId,
      name: 'Availability',
      metrics: [
        {
          id: 'metric-3' as EntityId,
          name: 'Availability'
        },
        {
          id: 'metric-4' as EntityId,
          name: 'Average Response Time'
        }
      ]
    },
    {
      id: 'metric-group-3' as EntityId,
      name: 'Status, Events, Alerts',
      metrics: [
        {
          id: 'metric-4' as EntityId,
          name: 'Alerts',
          subMetrics: [
            {
              id: 'submetric-1' as EntityId,
              name: 'Is Down'
            }
          ]
        },
        {
          id: 'metric-4' as EntityId,
          name: 'Average Response Time'
        }
      ]
    }
  ];

  data: EntityGroup[] = [
    {
      id: 'group-1' as EntityId,
      name: 'Servers',
      icon: 'server',
      entities: [
        {
          id: 'entity-1' as EntityId,
          name: 'Server 1',
          metrics: this.metrics
        },
        {
          id: 'entity-2' as EntityId,
          name: 'Server 2',
          metrics: this.metrics
        }
      ]
    },
    {
      id: 'group-2' as EntityId,
      name: 'Virtual Servers',
      icon: 'server',
      entities: [
        {
          id: 'entity-3' as EntityId,
          name: 'VPS 1',
          metrics: this.metrics
        },
        {
          id: 'entity-4' as EntityId,
          name: 'VPS 2',
          metrics: this.metrics
        }
      ]
    }
  ];
}
