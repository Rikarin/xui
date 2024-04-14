import { ApplicationRef, Injectable, Signal, signal, WritableSignal } from '@angular/core';
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
  private _isDragging = signal(false);
  private _charts: WritableSignal<Chart>[] = [];

  get charts() {
    return this._charts;
  }

  constructor(private appRef: ApplicationRef) {}

  getChart(index: number): Signal<Chart> {
    return this._charts?.[index]?.asReadonly();
  }

  addChart(position: number, trends: Chart) {
    this._charts.splice(position, 0, signal(trends));
  }

  addTrend(chartPos: number, trend: Trend) {
    const chart = this._charts[chartPos];
    chart.update(x => [...x, trend]);
  }

  removeTrend(chartPos: number, trendPos: number) {
    this._charts[chartPos].update(x => chart.splice(trendPos, 1));
    const chart = this._charts[chartPos]();

    if (!chart.length) {
      this._charts.splice(chartPos, 1);
    }
  }

  get isDragging() {
    return this._isDragging.asReadonly();
  }

  dragStarted() {
    this._isDragging.set(true);
    this.appRef.tick(); // Not able to D'n'D metric unless ticked
  }

  dragEnded() {
    this._isDragging.set(false);
  }

  connectChart(chart: ECharts) {
    this._eCharts.push(chart);
    connect(this._eCharts);
  }
}
