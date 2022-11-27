import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { EntityGroup, EntityId } from './analysis.types';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AnalysisService } from './analysis.service';

@Component({
  selector: 'xui-analysis',
  exportAs: 'xuiAnalysis',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./analysis.scss'],
  templateUrl: './analysis.component.html',
  providers: [AnalysisService]
})
export class XuiAnalysisComponent {
  isDragging$ = this.analysisService.isDragging$;
  closed = false;

  @Input() entities?: EntityGroup[];
  @Input() loadData?: (entityId: EntityId, metricId: EntityId) => { date: string; value: number };

  get charts() {
    return this.analysisService.charts;
  }

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    const first = this.entities?.[0].entities[0]!;
    this.analysisService.addChart(0, [
      {
        entity: first,
        metric: first?.metrics?.[0].metrics?.[0]!
      }
    ]);

    this.analysisService.addTrend(0, {
      entity: first,
      metric: first?.metrics?.[0].metrics?.[1]!
    });

    this.analysisService.addChart(1, [
      {
        entity: first,
        metric: first?.metrics?.[0].metrics?.[0]!
      }
    ]);

    this.analysisService.addChart(3, [
      {
        entity: first,
        metric: first?.metrics?.[0].metrics?.[0]!
      }
    ]);

    // this.analysisService.addTrend(0, {
    //   entity: first,
    //   metric: first?.metrics?.[0].metrics?.[1]!
    // });
    // this.analysisService.addTrend(0, {
    //   entity: first,
    //   metric: first?.metrics?.[0].metrics?.[1]!
    // });
    // this.analysisService.addTrend(0, {
    //   entity: first,
    //   metric: first?.metrics?.[0].metrics?.[1]!
    // });
  }

  dropped(event: CdkDragDrop<any>, index: number, isPlaceholder = true) {
    if (isPlaceholder) {
      this.analysisService.addChart(index, [event.item.data]);
    } else {
      this.analysisService.addTrend(index, event.item.data);
    }
  }
}
