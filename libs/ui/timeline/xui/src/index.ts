import { XuiTimeline } from './lib/timeline';
import { XuiTimelineItem } from './lib/timeline-item';

export * from './lib/timeline';
export * from './lib/timeline-item';
export * from './lib/timeline.token';

export const XuiTimelineImports = [XuiTimeline, XuiTimelineItem] as const;
