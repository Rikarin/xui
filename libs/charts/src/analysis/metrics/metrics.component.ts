import { Component, Input } from '@angular/core';
import { Entity, EntityGroup, EntityId, MetricGroup } from '../analysis.types';
import { AnalysisService } from '../analysis.service';

@Component({
  selector: 'xui-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent {
  opened: EntityId[] = [];
  active: Entity | null = null;

  @Input() entities?: EntityGroup[];

  constructor(public analysis: AnalysisService) {}

  ngOnInit() {
    // Testing
    this.active = this.entities?.[0].entities[0] ?? null;
  }

  isActive(entity: Entity) {
    return this.active?.id === entity.id;
  }

  activate(entity: Entity) {
    this.active = entity;
  }

  isOpened(group: EntityGroup | MetricGroup) {
    // return true;
    return this.opened.includes(group.id);
  }

  toggleGroup(group: EntityGroup | MetricGroup) {
    if (this.isOpened(group)) {
      this.opened = this.opened.filter(x => x !== group.id);
    } else {
      this.opened = [...this.opened, group.id];
    }
  }
}
