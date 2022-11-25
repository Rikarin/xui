import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entity, Metric } from './analysis.types';

export interface Trend {
  metric: Metric;
  entity: Entity;
  // TODO: polled data, etc.
}

export type Chart = Trend[];

@Injectable()
export class AnalysisService {
  private _charts: BehaviorSubject<Chart>[] = [];

  get charts() {
    return this._charts;
  }

  getChart(index: number): Observable<Chart> {
    return this._charts?.[index]?.asObservable();
  }

  addChart(position: number, trends: Chart) {
    this._charts.splice(position, 0, new BehaviorSubject<Chart>(trends));
  }

  addTrend(chartPos: number, trend: Trend) {
    const chart = this._charts[chartPos];

    // if (chart.value.length === 4) {
    // this.snackBar.open('Maximum of 4 trends per charts is allowed!', null, {
    //   duration: 2000
    // });
    //   return;
    // }

    chart.next([...chart.value, trend]);
  }

  removeTrend(chartPos: number, trendPos: number) {
    const chart = this._charts[chartPos].value;

    // chart[trendPos].series.remove();
    chart.splice(trendPos, 1);

    if (!chart.length) {
      this._charts.splice(chartPos, 1);
    }
  }
}
