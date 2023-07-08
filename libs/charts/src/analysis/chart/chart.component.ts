import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { AnalysisService } from '../analysis.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'xui-analysis-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnDestroy {
  private chart!: ECharts;
  @Input() index!: number;

  chartOptions: EChartsOption = {
    grid: {
      left: 40,
      top: 10,
      right: 40,
      bottom: 40
    },
    tooltip: {
      showContent: false,
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },

    xAxis: [
      {
        type: 'category',
        axisLine: {
          // show: true,
          lineStyle: {
            width: 2
            // type: 'solid'
          }
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      {
        axisLine: {
          onZero: false,

          lineStyle: {
            width: 2
          }
        }
      }
    ],
    yAxis: [
      {
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
            type: 'solid'
          }
        }
        // type: 'value'
        // splitNumber: 3,
      },
      {
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            width: 2,
            type: 'solid'
          }
        }
        // splitNumber: 3,
      }
    ],
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        showSymbol: false,
        type: 'line'
      },
      {
        data: [420, 332, 981, 924, 4290, 1930, 2320],
        yAxisIndex: 1,
        showSymbol: false,
        type: 'line'
      }
    ]
  };

  get trends$() {
    return this.analysisService.getChart(this.index);
  }

  constructor(private analysisService: AnalysisService, @Inject(DOCUMENT) private document: Document) {}

  ngOnDestroy() {}

  onChartInit(chart: ECharts) {
    this.chart = chart;
    this.analysisService.connectChart(chart);

    chart.on('highlight', (event: any) => {
      console.log('event', event);

      // const series = this.chart.getVisual({ seriesIndex: 1, dataIndex: 1 }, 'symbol');//.getSeries();
      const series = (this.chart as any).getModel().getSeries();

      // const values = series.map(x => x)

      console.log('series', series);

      this.document.addEventListener('resize', () => {
        console.log('resize');
        chart.resize();
      });
    });
  }
}
