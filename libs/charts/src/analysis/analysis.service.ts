import { ApplicationRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entity, Metric } from './analysis.types';
import { connect, ECharts } from 'echarts';

export interface Trend {
  metric: Metric;
  entity: Entity;
  // TODO: polled data, etc.
}

export type Chart = Trend[];

@Injectable()
export class AnalysisService {
  private _eCharts: ECharts[] = [];
  private _isDragging = new BehaviorSubject(false);
  private _charts: BehaviorSubject<Chart>[] = [];

  get charts() {
    return this._charts;
  }

  constructor(private appRef: ApplicationRef) {}

  getChart(index: number): Observable<Chart> {
    return this._charts?.[index]?.asObservable();
  }

  addChart(position: number, trends: Chart) {
    this._charts.splice(position, 0, new BehaviorSubject<Chart>(trends));
  }

  addTrend(chartPos: number, trend: Trend) {
    const chart = this._charts[chartPos];
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

  get isDragging$() {
    return this._isDragging.asObservable();
  }

  dragStarted() {
    this._isDragging.next(true);
    this.appRef.tick(); // Not able to D'n'D metric unless ticked
  }

  dragEnded() {
    this._isDragging.next(false);
  }

  connectChart(chart: ECharts) {
    this._eCharts.push(chart);
    connect(this._eCharts);
  }
}
