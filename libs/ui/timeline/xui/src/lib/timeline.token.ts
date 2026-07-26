import { createXConfigToken } from '@xui/core';
import type { XuiTimelineMode } from './timeline';
import type { XuiTimelineColor } from './timeline-item';

export interface XuiTimelineConfig {
  mode: XuiTimelineMode;
  /** The default dot colour of `xui-timeline-item`. */
  color: XuiTimelineColor;
}

export const [injectXuiTimelineConfig, provideXuiTimelineConfig] = createXConfigToken<XuiTimelineConfig>(
  'XuiTimelineConfig',
  { mode: 'left', color: 'primary' }
);
